import React, { useEffect, useState } from 'react';
import ForgeReconciler from '@forge/react';
import { invoke } from '@forge/bridge';
import { TextArea, Image } from "@forge/react";

const App = () => {
  const [data, setData] = useState(null);
  const [description, setDescription] = useState(null);

  useEffect(() => {
    invoke('getdescription').then(setData);
  }, []);

  useEffect(() => {
    if (data) {
      invoke('enhancedescription', { description: data }).then((enhancedDesc) => {
        setDescription(enhancedDesc);
      }).catch((error) => {
        console.error('Error in enhancedescription invoke:', error);
      });
    }
  }, [data]);
  return (
    <>
      {description ?
        (
          <TextArea label="Description"
            name="description"
            value={JSON.stringify(description).replace(/"/g, '').replace(/\\n/g, '\n').replace(/\\/g, '')} />) : (<Image src='https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif' alt='Load'></Image>)
      }

    </>
  );


};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
