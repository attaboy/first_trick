import React from 'react';
import './FaceDownCard.scss';

interface Props {
  selected?: boolean
}

export function FaceDownCard(props: Props) {
  return (
    <div className={`FaceDownCard ${
      props.selected ? "FaceDownCardSelected" : ""
    }`} />
  );
}
