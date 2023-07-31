import React from 'react';
import { useEffect, useState, useRef } from "react";
import "./items.scss";
import Card from './card';
import { Link } from 'react-router-dom';

function shuffleCards(array) {
console.log("areasdasdasdas",array)
  const length = array.length;
  for (let i = length; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * i);
    const currentIndex = i - 1;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}

// Assuming getRandomNumber function is defined somewhere
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
function uniquePokemon(pokedata) {
    const uni = []
  
  // Generate 4 random numbers and store them in the array
    for (let i = 0; i < 6; i++) {
      let r= getRandomNumber(1, 1010); // Generating numbers between 1 and 100 (inclusive)
      let u = pokedata[r].url.split('/')[6]
      let obj = { type : pokedata[r].name, image : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"+u+".png"}
      //console.log("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"+u+".png")
      uni.push(obj)
      
    }
    return uni
  
  }
  let uniqueCardsArray = []
const Items = () => {
    
    const [showModal, setShowModal] = useState(false);
    useEffect(() =>{
        const fetchPokemonData = async () => {
          //const reqController = new AbortController()
          try {
            //let offset = getRandomNumber(1,600)
            let response = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1010');
            let jsonData = await response.json();
            let pokedata = jsonData.results
            console.log(pokedata)

            uniqueCardsArray = uniquePokemon(pokedata)
            return setCards(shuffleCards(uniqueCardsArray.concat(uniqueCardsArray)))
            //setPokemonData(jsonData.results);
            //setCorrectPokemonIndex(getRandomInt(50));
          } catch  {
            console.error('Error fetching data:');
          }
          
        };
          fetchPokemonData()
          
          return () => {
            
          }
        
      },
      //[state.fetchCount]
      [showModal])

      const [cards, setCards] = useState([]);
      //console.log("cards", cards)
      const [openCards, setOpenCards] = useState([]);
      const [clearedCards, setClearedCards] = useState({});
      const [shouldDisableAllCards, setShouldDisableAllCards] = useState(false);
      const [moves, setMoves] = useState(0);
      const [bestScore, setBestScore] = useState(
        JSON.parse(localStorage.getItem("bestScore")) || Number.POSITIVE_INFINITY
      );
      
      const timeout = useRef(null);
    
  const disable = () => {
    setShouldDisableAllCards(true);
  };
  const enable = () => {
    setShouldDisableAllCards(false);
  };

  const checkCompletion = () => {
    console.log(Object.values(clearedCards).length,uniqueCardsArray.length)
    if ((Object.values(clearedCards).length === uniqueCardsArray.length) && (uniqueCardsArray.length>0)) {
      setShowModal(true);
      console.log("yesss i set modal", showModal);
      const highScore = Math.min(moves, bestScore);
      setBestScore(highScore);
      localStorage.setItem("bestScore", highScore);
    }
  };
  const handleRestart = () => {
    setClearedCards({});
    setOpenCards([]);
    setShowModal(false);
    setMoves(0);
    setShouldDisableAllCards(false);
    // set a shuffled deck of cards
    uniqueCardsArray = uniquePokemon(pokedata)
    setCards(shuffleCards(uniqueCardsArray.concat(uniqueCardsArray)))
  };

  useEffect(() => {
    checkCompletion();
  }, [clearedCards]);
  useEffect(() => {
    let timeout = null;
    if (openCards.length === 2) {
      timeout = setTimeout(evaluate, 300);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [openCards]);

      // Check if both the cards have same type. If they do, mark them inactive
      const evaluate = () => {
        const [first, second] = openCards;
        if (cards[first].type === cards[second].type) {
          setClearedCards((prev) => ({ ...prev, [cards[first].type]: true }));
          setOpenCards([]);
          console.log("len:",Object.values(clearedCards).length,"keys",clearedCards)
          console.log("len of uni:",uniqueCardsArray)
          return;
        }
        // Flip cards after a 500ms duration
        timeout.current = setTimeout(() => {
          setOpenCards([]);
        }, 500);
      };
      
      const handleCardClick = (index) => {
        console.log("cleared c ", clearedCards)
        // Have a maximum of 2 items in array at once.

        if (openCards.length === 1) {
          setOpenCards((prev) => [...prev, index]);
          // increase the moves once we opened a pair
          setMoves((moves) => moves + 1);
        } else {
          // If two cards are already open, we cancel timeout set for flipping cards back
          clearTimeout(timeout.current);
          setOpenCards([index]);
        }
      };
 
      useEffect(() => {
        if (openCards.length === 2) {
          setTimeout(evaluate, 500);
        }
      }, [openCards]);

      const gradientBackground = {
        backgroundImage: 'linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)',
      };
    
      const checkIsFlipped = (index) => {
        return openCards.includes(index);
      };
    
      const checkIsInactive = (card) => {
        return Boolean(clearedCards[card.type]);
      };
    //console.log("MOdal",showModal)
      return (
        <div  style={gradientBackground} className="App">
          <header>
            <Link to= "/">
            <button class="fixed top-0 left-0 text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-lg font-bold mt-7 ml-5">
            Go back
            </button>
            </Link>


          <h3 class="text-center font-bold pt-3 pb-5 break-all text-3xl md:text-7xl">Play the Flip card game</h3>
            <h3 class="text-center font-bold pt-3 pb-5 text-blue-600 break-all text-xl md:text-4xl">
            Select two cards with the same content consecutively to make them vanish
            </h3>

          </header>
          <div className="container">
            {cards.map((card, index) => {
              return (
                <Card
                  key={index}
                  card={card}
                  index={index}
                  isDisabled={shouldDisableAllCards}
                  isInactive={checkIsInactive(card)}
                  isFlipped={checkIsFlipped(index)}
                  onClick={handleCardClick}
                />
              );
            })}
          </div>
        {(showModal) && (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/90 text-white flex justify-center items-center text-center">
          <div>
           <p className="text-6xl mb-4 font-bold">Hooray! You won </p>
 

            <p>
              Number of moves you took: {moves}
              <span className="text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="inline-block relative bottom-1 mx-1" viewBox="0 0 16 16">
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>

              </span>
            </p>

            <p className="mb-5">Your all-time best: {bestScore} </p>

            <button onClick={handleRestart} className="text-white bg-gradient-to-b from-indigo-500 mr-2 to-indigo-600 px-4 py-3 rounded text-lg font-bold">
              Play again
            </button>
            <Link to = "/">
            <button  className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 ml-2 py-3 rounded text-lg font-bold">
            Move to guess the pokemon
            </button>
            </Link>
          </div>
        </div>
      )}
        </div>
      );
};

export default Items;
