import { useState, useMemo } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([{role: "system", content: "The following is a conversation with an AI travel assistant. The assistant is helpful and knowledgeable. The assistant starts the conversation by asking about the user's departure city.  If the user replies with a city that has multiple airports, the assistant should list the airports in that city and ask for clarification as to which airport they want to depart from. Do not ask for this clarification in the case of metropolitan areas that have a single IATA code representing them, such as NYC. In those cases, use the IATA code for the metropolitan area. Once you know the airport or metropolitan area the user is departing from, call the function getFlights with the IATA code for that airport or metropolitan area."}]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useMemo(() => {
    // On first page load, sends system message to OpenAI API, giving it opportunity to respond with the initial message to the user
    const sendInitialMessage = async () => {
      
      try {
        // Hits the backend /chat endpoint, which calls the OpenAI API with the messages array
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        if (response.ok) {
          const data = await response.json();
          const dataMsg = data.message;
          // Takes response from OpenAI API and adds it to the messages so it is displayed to user
          setMessages(prevMessages => [...prevMessages, dataMsg ]);
        } else {
          console.error('Failed to send initial context to the server');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // Call the function
    sendInitialMessage();
 
  }, []);

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = { role: 'user', content: input};
      setInput('');
      setIsLoading(true);

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedMessages),
        });

        setIsLoading(false);
  
        if (response.ok) {
          const data = await response.json();
          const dataMsg = data.message;
          setMessages(responseMsg => [...responseMsg, dataMsg]);
        } else {
          console.error('Failed to send message to the server');
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Error:', error);
      }
    }
  }

  return (
    <div className="App"> 
      <div className="chat-container">
        {messages
        .filter(message => message.role === 'assistant' || message.role === 'user')
        .map((message, index) => (
          <div key={index} className={`chat-bubble ${message.role === 'assistant' ? 'assistant' : 'user'}`}>
            {message.content}
            </div>
        ))}
        {isLoading && (
  <div className="chat-bubble assistant typing-indicator">
    <span>.</span><span>.</span><span>.</span>
  </div>
)}
      </div>
      <div className="input-container">
       
        <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
        </div>       
    </div>
  )
}

export default App
