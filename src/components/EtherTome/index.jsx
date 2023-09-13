import React, { useState, useReducer } from 'react';
import { styled } from 'styletron-react';
import Surface from '../Surface';
import Title from '../Form/Title';
import Label from '../Form/Label';
import TextInput from '../Form/TextInput';
import NumberInput from '../Form/Number';
import FormButton from '../Form/Button';
import OptionButton from '../Form/OptionButton';
import useChatGPT from '../../hooks/useChatGPT';
import guides from '../../prompts/guides';
import viewTransition from '../../util/viewTransitions';
import SimulatedConversations from './SimulatedConversations';

import Loading from '../Loading';

const availableGuideIds = Object.keys(guides);

const reducer = (state, action) => {
  switch (action.type) {
    case 'topic':
      return { ...state, topic: action.payload };
    case 'numberOfMessages':
      return { ...state, numberOfMessages: action.payload };
    case 'guideIds-add':
      return { ...state, guideIds: [...state.guideIds, action.payload] };
    case 'guideIds-remove':
      return {
        ...state,
        guideIds: state.guideIds.filter((id) => id !== action.payload),
      };
    default:
      return state;
  }
};

const Container = styled('div', {
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const Form = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0 5em',
  width: '100%',
  maxWidth: '100ch',
});

export default () => {
  const [simulatedConversations, setSimulatedConversations] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    topic: '',
    numberOfMessages: 5,
    guideIds: ['default'],
  });
  const { topic, numberOfMessages, guideIds } = state;

  const onTopicChange = (e) =>
    dispatch({ type: 'topic', payload: e.target.value });
  const onNumberOfMessagesChange = (e) =>
    dispatch({ type: 'numberOfMessages', payload: e.target.value });
  const onGuideIdsChange = (guideId) =>
    guideIds.includes(guideId)
      ? dispatch({ type: 'guideIds-remove', payload: guideId })
      : dispatch({ type: 'guideIds-add', payload: guideId });

  const onSubmit = async (e) => {
    e.preventDefault();
    viewTransition(() => setIsStreaming(true));
    const textDecoder = new TextDecoder();
    const response = await fetch('/api/fine-tune/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        numberOfMessages,
        guideIds,
      }),
    });
    const reader = response.body.getReader();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const decodedValue = textDecoder.decode(value);
      buffer += decodedValue;

      try {
        const { messages } = JSON.parse(buffer);
        if (!messages) {
          throw new Error('Invalid JSON');
        }

        const adaptedConversation = {
          id: Date.now(),
          messages,
        };

        viewTransition(() => {
          setSimulatedConversations((curr) => [...curr, adaptedConversation]);
        });

        // Clear the buffer after successfully parsing the JSON
        buffer = '';
      } catch (e) {
        // JSON is incomplete, continue reading
      }
    }

    viewTransition(() => setIsStreaming(false));
  };

  if (simulatedConversations.length) {
    const onApprove = (id) =>
      viewTransition(() => {
        const newSimulatedConversations = simulatedConversations.filter(
          (conversation) => conversation.id !== id,
        );
        setSimulatedConversations(newSimulatedConversations);
      });
    const onDisapprove = (id) =>
      viewTransition(() => {
        const newSimulatedConversations = simulatedConversations.filter(
          (conversation) => conversation.id !== id,
        );
        setSimulatedConversations(newSimulatedConversations);
      });
    return (
      <Container>
        <SimulatedConversations
          onApprove={onApprove}
          onDisapprove={onDisapprove}
          conversations={simulatedConversations}
        />
      </Container>
    );
  }

  return (
    <Container>
      {isStreaming ? (
        <Loading />
      ) : (
        <Form>
          <Title>Simulate Training Data</Title>
          <Surface $style={{ padding: '2em' }}>
            <Label as="h2">AI Prompts</Label>
            <div>
              {availableGuideIds.map((guideId) => (
                <OptionButton
                  key={guideId}
                  name={guideId}
                  value={guideIds.includes(guideId)}
                  onChange={() => onGuideIdsChange(guideId)}
                />
              ))}
            </div>

            <TextInput
              name="topic"
              placeholder="Elara"
              value={topic}
              onChange={onTopicChange}
            />

            <NumberInput
              name="number"
              value={numberOfMessages}
              onChange={onNumberOfMessagesChange}
            />
          </Surface>
          <FormButton onClick={onSubmit}>Simulate</FormButton>
        </Form>
      )}
    </Container>
  );
};