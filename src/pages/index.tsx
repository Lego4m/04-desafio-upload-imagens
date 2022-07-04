import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

type Card = {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface ApiImagesResponse {
  data: Card[];
  after: string | null;
}

export default function Home(): JSX.Element {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'images',
    async ({ pageParam = null }) => {
      const { data } = await api.get<ApiImagesResponse>('/api/images', { params: { after: pageParam } });

      return data;  
    },
    {
      getNextPageParam: (lastRequisitionInfos) => lastRequisitionInfos.after ?? null,
    }
  );

  const formattedData = useMemo(() => {
    return data?.pages.map((card) => card.data).flat()
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        
        { hasNextPage && (
          <Button
            isLoading={isFetchingNextPage}
            loadingText="Carregando..."
            onClick={() => fetchNextPage()}
            mt='10'
          >
            Carregar mais
          </Button>
        ) }
      </Box>
    </>
  );
}
