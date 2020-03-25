import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import PetsList from '../components/PetsList';
import NewPetModal from '../components/NewPetModal';
import Loader from '../components/Loader';

const ALL_PETS = gql`
  query AllPets {
    pets {
      id
      type
      name
      img
    }
  }
`;

const CREATE_PET = gql`
  mutation CreatePet($input: NewPetInput!) {
    addPet(input: $input) {
      id
      type
      name
      img
    }
  }
`;

export default function Pets() {
  const [modal, setModal] = useState(false);
  const { data, loading, error } = useQuery(ALL_PETS);
  const [createPet, newPet] = useMutation(CREATE_PET, {
    update: (cache, { data: { addPet } }) => {
      const { pets } = cache.readQuery({ query: ALL_PETS });

      cache.writeQuery({
        query: ALL_PETS,
        data: { pets: [...pets, addPet] },
      });
    },
  });

  if (loading || newPet.loading) {
    return <Loader />;
  }

  if (error || newPet.error) {
    return <p>error</p>;
  }

  const onSubmit = input => {
    createPet({ variables: { input } });
    setModal(false);
  };

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />;
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets} />
      </section>
    </div>
  );
}
