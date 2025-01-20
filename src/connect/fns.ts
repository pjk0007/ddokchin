export const fns: {
  [key: string]: (args: any) => any;
} = {
  changeBackgroundColor: ({ color }: { color: string }) => {
    document.body.style.backgroundColor = color;
    return { success: true, color };
  },
  changeTextColor: ({ color }: { color: string }) => {
    document.body.style.color = color;
    return { success: true, color };
  },
};

export const configureData = (channel: RTCDataChannel) => {
  console.log('Configuring data channel');
  const event = {
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      tools: [
        {
          type: 'function',
          name: 'changeBackgroundColor',
          description: 'Changes the background color of a web page',
          parameters: {
            type: 'object',
            properties: {
              color: {
                type: 'string',
                description: 'A hex value of the color',
              },
            },
          },
        },
        {
          type: 'function',
          name: 'changeTextColor',
          description: 'Changes the text color of a web page',
          parameters: {
            type: 'object',
            properties: {
              color: {
                type: 'string',
                description: 'A hex value of the color',
              },
            },
          },
        },
      ],
    },
  };
  channel.send(JSON.stringify(event));
};
