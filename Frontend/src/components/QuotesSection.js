import React, { useState, useEffect } from 'react';

const QuotesSection = () => {
  const quotes = [
    {
      text: "We make a living by what we get, but we make a life by what we give.",
      author: "Winston Churchill",
      emoji: "💝"
    },
    {
      text: "The meaning of life is to find your gift. The purpose of life is to give it away.",
      author: "Pablo Picasso",
      emoji: "🎨"
    },
    {
      text: "No act of kindness, no matter how small, is ever wasted.",
      author: "Aesop",
      emoji: "🌟"
    },
    {
      text: "The best way to not feel hopeless is to get up and do something.",
      author: "Barack Obama",
      emoji: "🚀"
    },
    {
      text: "Alone we can do so little; together we can do so much.",
      author: "Helen Keller",
      emoji: "🤝"
    },
    {
      text: "Be the change you wish to see in the world.",
      author: "Mahatma Gandhi",
      emoji: "🌍"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <section className="quotes-section">
      <div className="quotes-container">
        <h2>💭 Words of Inspiration</h2>
        <div className="quote-carousel">
          <div className="quote-card active">
            <div className="quote-emoji">{quotes[currentQuote].emoji}</div>
            <blockquote>
              "{quotes[currentQuote].text}"
            </blockquote>
            <cite>- {quotes[currentQuote].author}</cite>
          </div>
        </div>
        <div className="quote-indicators">
          {quotes.map((_, index) => (
            <button
              key={index}
              className={`quote-indicator ${index === currentQuote ? 'active' : ''}`}
              onClick={() => setCurrentQuote(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuotesSection;