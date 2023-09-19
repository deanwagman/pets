import React, { useState, useRef } from 'react';

const UserInput = ({ onSubmit = () => {} }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef({ focus: () => {} });

  const onClick = () => {
    onSubmit(message);
    setMessage('');
    console.log({ message });
    inputRef.current.focus();
  };

  const onKeyDown = ({ key, shiftKey }) => {
    // If user presses enter without shift key, submit message
    if (key === 'Enter' && !shiftKey) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div>
      <textarea
        type="text"
        placeholder="Type a message"
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyDown}
        value={message}
        rows={1}
        ref={inputRef}
      />
      <button onClick={onClick}>
        <svg
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#000000"
        >
          <g
            clipPath="url(#send-diagonal_svg)"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22.152 3.553L11.178 21.004l-1.67-8.596L2 7.898l20.152-4.345zM9.456 12.444l12.696-8.89"></path>
          </g>
          <defs>
            <clipPath id="send-diagonal_svg__clip">
              <path fill="#fff" d="M0 0h24v24H0z"></path>
            </clipPath>
          </defs>
        </svg>
      </button>
    </div>
  );
};

export default UserInput;
