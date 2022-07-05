import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { FieldError, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

type AddImageFormData = {
  image: FileList,
  title: string;
  description: string;
}

interface ImageData {
  url: string;
  title: string;
  description: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: (files) => (files[0].size < 10000000),
        acceptedFormats: (files) => (
          /image\/(jpeg|png|gif)/.test(files[0]?.type) || 'Somente são aceitos arquivos PNG, JPEG e GIF'
        ),
      },
    },
    title: {
      required: 'Título obrigatório',
      minLenght: {
        value: 2,
        message: 'Mínimo de 2 caracteres'
      },
      maxLenght: {
        value: 20,
        message: 'Máximo de 20 caracteres'
      }
    },
    description: {
      required: 'Descrição obrigatória',
      maxLenght: {
        max: 65,
        message: 'Máximo de 65 caracteres'
      }
    },
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    async ({ url, description, title }: ImageData) => {
      await api.post('/api/images', {
        url,
        description,
        title,
      });
    },
    {
      onSuccess: () => { queryClient.invalidateQueries('images') },
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit: SubmitHandler<AddImageFormData> = async ({ title, description }) => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          description: 'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
          status: 'info'
        });

        return;
      } 
      
      await mutation.mutateAsync({
        title,
        description,
        url: imageUrl,
      });

      toast({
        title: 'Imagem cadastrada',
        description: 'Sua imagem foi cadastrada com sucesso.',
        status: 'success',
      })
    } catch {
      toast({
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
        status: 'error',
      })
    } finally {
      closeModal();
      reset();
      setImageUrl('');
      setLocalImageUrl('');
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image as FieldError}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title as FieldError}
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description as FieldError}
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
