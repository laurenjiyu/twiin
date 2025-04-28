import React from 'react';
import { Ionicons } from '@expo/vector-icons';

// TabIcon is just a little reusable icon renderer
const TabIcon = ({ name, focused }) => {
  return (
    <Ionicons
      name={name}
      size={28}
      color={focused ? '#00FF00' : '#555'} // green if active, grayish if not
    />
  );
};

export default TabIcon;
