import "./styles.css";
import { useEffect, useState } from "react";
import { Card, Button } from "antd";
import axios from "axios";

interface CardHand {
  image: string;
  value: number;
  suit: string;
  flipped: boolean;
}

export default function App() {
  const [numCards, setNumCards] = useState<number>(52);
  const [isWinVisible1, setIsWinVisible1] = useState(false);
  const [isLoseVisible1, setIsLoseVisible1] = useState(false);
  const [isWinVisible2, setIsWinVisible2] = useState(false);
  const [isLoseVisible2, setIsLoseVisible2] = useState(false);
  const [isWinVisible3, setIsWinVisible3] = useState(false);
  const [isLoseVisible3, setIsLoseVisible3] = useState(false);
  const [isWinVisible4, setIsWinVisible4] = useState(false);
  const [isLoseVisible4, setIsLoseVisible4] = useState(false);
  const [isDivVisible, setIsDivVisible] = useState(false);
  const [userConins, setUserConins] = useState<number[]>([
    5000,
    5000,
    5000,
    5000
  ]);
  const [userScores, setUserScores] = useState<number[]>([]);
  const backCard = [
    {
      image: "https://deckofcardsapi.com/static/img/back.png",
      value: 0,
      suit: "None",
      flipped: false
    },
    {
      image: "https://deckofcardsapi.com/static/img/back.png",
      value: 0,
      suit: "None",
      flipped: false
    },
    {
      image: "https://deckofcardsapi.com/static/img/back.png",
      value: 0,
      suit: "None",
      flipped: false
    }
  ];
  const [userHands, setUserHands] = useState<CardHand[][]>([]);
  const [tempScore, setTempScore] = useState<number[]>([]);
  const flipAllCards = () => {
    const updatedHands = userHands.map((hand) =>
      hand.map((card) => ({
        ...card,
        flipped: true
      }))
    );
    setUserHands(updatedHands);
    let stateList: boolean[] = [false, false, false, false];
    const maxScore = Math.max(...tempScore);
    tempScore.map((score, index) => {
      if (score == maxScore) {
        stateList[index] = true;
      }
    });
    const updatedUserCoins = [...userConins];
    if (stateList[0]) {
      setIsWinVisible1(true);
    } else {
      if (updatedUserCoins[0] > 0) {
        updatedUserCoins[0] -= 900;
        setIsLoseVisible1(true);
      }
    }
    if (stateList[1]) {
      setIsWinVisible2(true);
    } else {
      if (updatedUserCoins[1] > 0) {
        updatedUserCoins[1] -= 900;
        setIsLoseVisible2(true);
      }
    }
    if (stateList[2]) {
      setIsWinVisible3(true);
    } else {
      if (updatedUserCoins[2] > 0) {
        updatedUserCoins[2] -= 900;
        setIsLoseVisible3(true);
      }
    }
    if (stateList[3]) {
      setIsWinVisible4(true);
    } else {
      if (updatedUserCoins[3] > 0) {
        updatedUserCoins[3] -= 900;
        setIsLoseVisible4(true);
      }
    }
    updatedUserCoins.map((coin, index) => {
      if (coin < 0) {
        updatedUserCoins[index] = 0;
      }
    });
    setUserConins(updatedUserCoins);
    setUserScores(tempScore);
  };
  const [showError, setShowError] = useState(false);
  const [deckId, setDeckId] = useState<string | null>(null);

  const drawCards = async () => {
    let newUserHands: CardHand[][] = [];
    let remaincard: number = 0;
    let scoreList: number[] = [];
    let userMap: number[] = [1, 1, 1, 1];
    let outUser: number = 0;
    userConins
      .slice()
      .reverse()
      .map((coin, index) => {
        if (coin == 0) {
          userMap[index] = 0;
          outUser++;
        }
      });
    if (numCards < (4 - outUser) * 3) {
      setShowError(true);
    } else {
      try {
        for (let i = 0; i < 4; i++) {
          if (userMap[i]) {
            const response = await axios.get(
              "https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=3"
            );
            if (response.data.success) {
              const listHandCard: CardHand[] = response.data.cards.map(
                (card: any) => ({
                  image: card.image,
                  value: card.value,
                  suit: card.suit,
                  flipped: false
                })
              );
              newUserHands.push(listHandCard);
              remaincard = response.data.remaining;
              let score = 0;
              response.data.cards.forEach((card: any) => {
                if (card.value === "ACE") {
                  score += 1;
                } else if (
                  card.value === "JACK" ||
                  card.value === "QUEEN" ||
                  card.value === "KING"
                ) {
                  score += 10;
                } else if (!isNaN(parseInt(card.value, 10))) {
                  score += parseInt(card.value, 10); // Add numeric card values
                }
              });
              scoreList.push(score % 10);
            } else {
              console.error("Draw cards failed");
            }
          } else {
            newUserHands.push([]);
            scoreList.push(-1);
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
      setNumCards(remaincard);
    }
    setIsDivVisible(true);
    newUserHands.reverse();
    setUserHands(newUserHands);
    scoreList.reverse();
    setTempScore(scoreList);
  };

  const shuffleCards = async () => {
    try {
      const response = await axios.get(
        "https://deckofcardsapi.com/api/deck/" + deckId + "/shuffle/"
      );
      if (response.data.success) {
        setDeckId(response.data.deck_id);
      } else {
        console.error("Shuffle new deck failed.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
    setNumCards(52);
  };

  const resetGame = () => {
    setUserScores([]);
    setIsDivVisible(false);
    setIsWinVisible1(false);
    setIsLoseVisible1(false);
    setIsWinVisible2(false);
    setIsLoseVisible2(false);
    setIsWinVisible3(false);
    setIsLoseVisible3(false);
    setIsWinVisible4(false);
    setIsLoseVisible4(false);
  };
  const renderOutcomeElement = (
    isVisible: boolean,
    bgColor: string,
    text: string
  ) =>
    isVisible && (
      <div
        className="win-element"
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          background: bgColor,
          padding: "5px 10px",
          fontWeight: "bold",
          fontSize: "18px",
          color: "#fff",
          animation: "tiltAnimation 1s ease-out 0s forwards"
        }}
      >
        {text}
      </div>
    );
  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const response = await axios.get(
          "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
        );
        if (response.data.success) {
          setDeckId(response.data.deck_id);
        } else {
          console.error("Shuffle new deck failed.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    if (!deckId) {
      fetchDeck();
    }
  }, [deckId]);

  return (
    <div style={{ backgroundColor: "#135200" }}>
      {showError && (
        <div className="popup-error-container">
          <div className="popup-error">
            <p>
              Not enough cards for users. Click "Shuffle" to reshuffle the deck.
            </p>
            <button
              className="close-button"
              onClick={() => setShowError(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Card
          className="user-card"
          bordered={true}
          style={{
            width: 230,
            height: 230,
            margin: "10px",
            backgroundColor: "#deb887",
            fontWeight: "530",
            fontFamily: "Time-New-Roman",
            position: "relative"
          }}
        >
          <div className="card-container" style={{ height: 80 }}>
            {isDivVisible &&
              userHands[0] &&
              userHands[0].map((hand, index) => (
                <div
                  key={index}
                  className={`card ${hand.flipped ? "flipped" : ""}`}
                >
                  <img
                    src={hand.flipped ? hand.image : backCard[index].image}
                    alt={`${hand.value} of ${hand.suit}`}
                    style={{ width: "50px", height: "70px", margin: "5px" }}
                  />
                </div>
              ))}
          </div>
          {renderOutcomeElement(isWinVisible1, "gold", "Win")}
          {renderOutcomeElement(isLoseVisible1, "red", "Lose")}
          <p>Coins: {userConins[0]}</p>
          {userConins[0] === 0 && (
            <div
              className="win-element"
              style={{
                position: "absolute",
                top: "0%",
                left: "50%",
                background: "#6D3815",
                padding: "5px 10px",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#fff"
              }}
            >
              Out of Coins
            </div>
          )}
          <h3>UserA</h3>
          <p>Point of 3 cards: {userScores[0] >= 0 ? userScores[0] : null}</p>
        </Card>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card
            className="user-card"
            bordered={true}
            style={{
              width: 230,
              height: 230,
              margin: "10px",
              marginRight: "0px",
              backgroundColor: "#deb887",
              fontWeight: "530",
              fontFamily: "Time-New-Roman",
              position: "relative"
            }}
          >
            <div className="card-container" style={{ height: 80 }}>
              {isDivVisible &&
                userHands[1] &&
                userHands[1].map((hand, index) => (
                  <div
                    key={index}
                    className={`card ${hand.flipped ? "flipped" : ""}`}
                  >
                    <img
                      src={hand.flipped ? hand.image : backCard[index].image}
                      alt={`${hand.value} of ${hand.suit}`}
                      style={{ width: "50px", height: "70px", margin: "5px" }}
                    />
                  </div>
                ))}
            </div>
            {renderOutcomeElement(isWinVisible2, "gold", "Win")}
            {renderOutcomeElement(isLoseVisible2, "red", "Lose")}
            <p>Coins: {userConins[1]}</p>
            {userConins[1] === 0 && (
              <div
                className="win-element"
                style={{
                  position: "absolute",
                  top: "0%",
                  left: "50%",
                  background: "#6D3815",
                  padding: "5px 10px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#fff"
                }}
              >
                Out of Coins
              </div>
            )}
            <h3>UserB</h3>
            <p>Point of 3 cards: {userScores[1] >= 0 ? userScores[1] : null}</p>
          </Card>
          <img
            src="https://deckofcardsapi.com/static/img/back.png"
            width="8%"
            height="8%"
            style={{ marginTop: 50, marginLeft: 80, marginRight: 80 }}
          ></img>
          <Card
            className="user-card"
            bordered={true}
            style={{
              width: 230,
              height: 230,
              margin: "10px",
              backgroundColor: "#deb887",
              fontWeight: "530",
              fontFamily: "Time-New-Roman",
              position: "relative"
            }}
          >
            <div className="card-container" style={{ height: 80 }}>
              {isDivVisible &&
                userHands[3] &&
                userHands[3].map((hand, index) => (
                  <div
                    key={index}
                    className={`card ${hand.flipped ? "flipped" : ""}`}
                  >
                    <img
                      src={hand.flipped ? hand.image : backCard[index].image}
                      alt={`${hand.value} of ${hand.suit}`}
                      style={{ width: "50px", height: "70px", margin: "5px" }}
                    />
                  </div>
                ))}
            </div>
            {renderOutcomeElement(isWinVisible4, "gold", "Win")}
            {renderOutcomeElement(isLoseVisible4, "red", "Lose")}
            <p>Coins: {userConins[3]}</p>
            {userConins[3] === 0 && (
              <div
                className="win-element"
                style={{
                  position: "absolute",
                  top: "0%",
                  left: "50%",
                  background: "#6D3815",
                  padding: "5px 10px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#fff"
                }}
              >
                Out of Coins
              </div>
            )}
            <h3>UserD</h3>
            <p>Point of 3 cards: {userScores[3] >= 0 ? userScores[3] : null}</p>
          </Card>
        </div>

        <Card
          className="user-card"
          bordered={true}
          style={{
            width: 230,
            height: 230,
            margin: "10px",
            backgroundColor: "#deb887",
            fontWeight: "530",
            fontFamily: "Time-New-Roman",
            position: "relative"
          }}
        >
          <div className="card-container" style={{ height: 80 }}>
            {isDivVisible &&
              userHands[2] &&
              userHands[2].map((hand, index) => (
                <div
                  key={index}
                  className={`card ${hand.flipped ? "flipped" : ""}`}
                >
                  <img
                    src={hand.flipped ? hand.image : backCard[index].image}
                    alt={`${hand.value} of ${hand.suit}`}
                    style={{ width: "50px", height: "70px", margin: "5px" }}
                  />
                </div>
              ))}
          </div>

          {renderOutcomeElement(isWinVisible3, "gold", "Win")}
          {renderOutcomeElement(isLoseVisible3, "red", "Lose")}
          <p>Coins: {userConins[2]}</p>
          {userConins[2] === 0 && (
            <div
              className="win-element"
              style={{
                position: "absolute",
                top: "0%",
                left: "50%",
                background: "#6D3815",
                padding: "5px 10px",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#fff"
              }}
            >
              Out of Coins
            </div>
          )}
          <h3>UserC</h3>
          <p>Point of 3 cards: {userScores[2] >= 0 ? userScores[2] : null}</p>
        </Card>
      </div>

      <div>
        <Card
          bordered={false}
          style={{
            width: 300,
            textAlign: "center",
            backgroundColor: "#135200",
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          <Button
            disabled={true}
            style={{
              width: 250,
              height: 50,
              color: "white",
              borderRadius: 100,
              marginBottom: 30,
              backgroundColor: "#9254de",
              fontSize: 21,
              fontFamily: "Time-New-Roman"
            }}
          >
            Deck Cards {numCards}
          </Button>
          <Button
            style={{
              color: "white",
              backgroundColor: "#7cb305",
              borderRadius: 10
            }}
            onClick={() => shuffleCards()}
          >
            Shuffle
          </Button>
          <Button
            style={{
              color: "white",
              backgroundColor: "#fadb14",
              borderRadius: 10,
              marginLeft: 20
            }}
            onClick={() => drawCards()}
          >
            Draw
          </Button>
          <Button
            style={{
              color: "white",
              backgroundColor: "black",
              borderRadius: 10,
              marginLeft: 20
            }}
            onClick={flipAllCards}
          >
            Reveal
          </Button>
          <Button
            style={{
              marginTop: 10,
              borderRadius: 10,
              color: "white",
              backgroundColor: "red"
            }}
            onClick={() => resetGame()}
          >
            Reset
          </Button>
        </Card>
      </div>
    </div>
  );
}
