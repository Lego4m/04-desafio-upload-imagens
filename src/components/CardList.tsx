import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

export function CardList({ cards }: CardsProps): JSX.Element {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const [imageUrl, setImageUrl] = useState('');

  function handleViewImage(url: string) {
    setImageUrl(url);
    onOpen();
  }

  return (
    <>
      <SimpleGrid
        columns={[1, 2, 3]}
        spacing="10"
      > 
        { cards.map((card) => (
          <Card 
            key={card.id}
            data={card}
            viewImage={() => handleViewImage(card.url)}
          />
        )) }
      </SimpleGrid>

      <ModalViewImage isOpen={isOpen} onClose={onClose} imgUrl={imageUrl} />
    </>
  );
}
