import { useEffect } from "react"
import { useImmerReducer } from "use-immer"
import { useRef } from "react";
import { Link } from "react-router-dom";
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) { 
 
      // Generate random number 
      var j = Math.floor(Math.random() * (i + 1));
                 
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
     
  return array;
}

function uniquePokemon(pokedata) {
  const uni = []

// Generate 4 random numbers and store them in the array
  for (let i = 0; i < 200; i++) {
    let r= getRandomNumber(1, 1010); // Generating numbers between 1 and 100 (inclusive)
    let u = pokedata[r].url.split('/')[6]
    let obj = { name : pokedata[r].name, img : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"+u+".png"}
    //console.log("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"+u+".png")
    uni.push(obj)
    
  }
  return uni

}

function ourReducer(draft,action){
  if (draft.points > draft.highScore) draft.highScore = draft.points

  switch (action.type){
    case "goBack":
      draft.playing = false
      draft.currentQuestion= null
      return
    case "startPlaying":
      draft.timeRemaining = 30
      draft.points = 0
      draft.strikes = 0
      draft.playing = true
      draft.currentQuestion = generateQuestion()
      draft.bigCollection = shuffleArray(draft.bigCollection)
      return
    case "addToCollection":
      draft.bigCollection = draft.bigCollection.concat(action.value)
      return

    case "guessAttempt":
      if (!draft.playing) return
      if (action.value === draft.currentQuestion.answer) {
        draft.points++
        draft.currentQuestion = generateQuestion()
      } else {
        draft.strikes++
        if (draft.strikes >= 3) {
          draft.playing = false
        }
      }
    case "decreaseTime":
      if (draft.timeRemaining <= 0) {
        draft.playing = false
      } else {
        draft.timeRemaining--
      }
      return
  }
  function generateQuestion() {
    if (draft.bigCollection.length <= 12) {
      draft.fetchCount++
    }

    if (draft.currentQuestion) {
      draft.bigCollection = draft.bigCollection.slice(4, draft.bigCollection.length)
    }

    const tempRandom = Math.floor(Math.random() * 4)
    const justFour = draft.bigCollection.slice(0, 4)
    return {name: justFour[tempRandom].name, photos: justFour, answer: tempRandom }
  }
}

const initialState = {
  points: 0,
  strikes: 0,
  timeRemaining: 0,
  highScore: 0,
  bigCollection: [],
  currentQuestion: null,
  playing: false,
  fetchCount: 0
}

function HeartIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className={props.className} viewBox="0 0 16 16">
      <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z" />
    </svg>
  )
}


function App() {
  const timer = useRef(null)
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)
  useEffect(() => {
    if (state.bigCollection.length) {
      state.bigCollection.slice(0, 8).forEach(pic => {
        new Image().src = pic.img
      })
    }
  }, [state.bigCollection])

  useEffect(() => {
    dispatch({ type: "receiveHighScore", value: localStorage.getItem("highscore") })
  }, [])

  useEffect(() => {
    if (state.highScore > 0) {
      localStorage.setItem("highscore", state.highScore)
    }
  }, [state.highScore])
  useEffect(() => {
    if (state.playing) {
      console.log("Interval created.")
      timer.current = setInterval(() => {
        dispatch({ type: "decreaseTime" })
      }, 1000)

      return () => {
        console.log("interval cleared from cleanup")
        clearInterval(timer.current)
      }
    }
  }, [state.playing])


  useEffect(() =>{
    const fetchPokemonData = async () => {
      //const reqController = new AbortController()
      try {
        //let offset = getRandomNumber(1,600)
        let response = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1010');
        let jsonData = await response.json();
        let pokedata = jsonData.results
        console.log(pokedata)
        
        let uniqueItems = uniquePokemon(pokedata)
        dispatch({type:"addToCollection", value : uniqueItems})

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
  [])


  return (
    <div >
    {state.currentQuestion && (
    <>
    <p className="text-center">
            <Link to= "/">
            <button onClick={() => dispatch({ type: "goBack" }) }class="fixed top-0 left-0 text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-lg font-bold mt-7 ml-5">
            Go back
            </button>
            </Link>

            <span className="text-zinc-400 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className={"inline-block " + (state.playing ? "animate-spin" : "")} viewBox="0 0 16 16">
                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z" />
                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z" />
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z" />
              </svg>
              <span className="font-mono text-4xl relative top-2 ml-3">0:{state.timeRemaining < 10 ? "0" + state.timeRemaining : state.timeRemaining}</span>
            </span>

            {[...Array(3 - state.strikes)].map((item, index) => {
              return <HeartIcon key={index} className="inline text-pink-600 mx-1" />
            })}
            {[...Array(state.strikes)].map((item, index) => {
              return <HeartIcon key={index} className="inline text-pink-100 mx-1" />
            })}
      </p>
      <h1 className="text-center font-bold pt-3 pb-10 break-all text-4xl md:text-7xl">{state.currentQuestion.name}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 px-5">
      {state.currentQuestion.photos.map((photo, index) => {
      return <div key={index} onClick= {()=>{dispatch({type: "guessAttempt", value: index})}} className="rounded-lg h-40 lg:h-80 bg-cover bg-center" style={{ backgroundImage: `url(${photo.img})` }}></div>
      })}
      </div>
    </>
    )}

    {state.playing == false && Boolean(state.bigCollection.length) && !state.currentQuestion && (
      <div>
      <header>

      <h3 class="text-center font-bold pt-3 pb-5 break-all text-3xl md:text-7xl">Pokemon guessing game</h3>
      <img src = "https://www.pokemon.com/static-assets/app/static3/img/og-default-image.jpeg"  className="h-60 w-60 mx-auto my-auto"/>

      </header>
      <p className="text-center mt-10 fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center">
        <button onClick={() => dispatch({ type: "startPlaying" })} className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-2xl font-bold">
          Play image quiz
        </button>
        <Link to = "/items">
        <button  className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 ml-5 py-3 rounded text-2xl font-bold">
          Play memory game
        </button>
        </Link>

      </p>
      </div>
    )}
    {(state.timeRemaining <= 0 || state.strikes >= 3) && state.currentQuestion && (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/90 text-white flex justify-center items-center text-center">
          <div>
            {state.timeRemaining <= 0 && <p className="text-6xl mb-4 font-bold">Time's Up!</p>}
            {state.strikes >= 3 && <p className="text-6xl mb-4 font-bold">3 Strikes; You're Out!</p>}

            <p>
              Your score:{" "}
              <span className="text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="inline-block relative bottom-1 mx-1" viewBox="0 0 16 16">
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
                {state.points}
              </span>
            </p>

            <p className="mb-5">Your all-time high score: {state.highScore}</p>

            <button onClick={() => dispatch({ type: "startPlaying" })} className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-lg font-bold">
              Play again
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
