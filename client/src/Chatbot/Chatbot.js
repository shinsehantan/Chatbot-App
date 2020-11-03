import React, { useEffect } from "react";
import Axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { saveMessage } from "../_actions/message_actions";
import Message from "./Sections/Message";
import { List, Icon, Avatar } from "antd";
import Card from "./Sections/Card";

function Chatbot() {
  const dispatch = useDispatch();
  const messagesFromRedux = useSelector((state) => state.message.messages);
  useEffect(() => {
    eventQuery("welcomeToMyWebsite");
  }, []);

  const textQuery = async (text) => {
    //First Need to take care of the message I sent
    let conversation = {
      who: "user",
      content: {
        text: {
          text: text,
        },
      },
    };

    dispatch(saveMessage(conversation));
    // console.log("text i sent", conversation);
    // we need to take care of the message chatbot sent
    const textQueryVariables = {
      text,
    };
    try {
      // i will send request to the text Query route

      const response = await Axios.post("/api/dialogflow/textQuery", textQueryVariables);
      //   console.log("try: ", response);

      for (let content of response.data.fulfillmentMessages) {
        conversation = {
          who: "bot",
          content: content,
        };
        dispatch(saveMessage(conversation));
      }
    } catch (error) {
      let conversation = {
        who: "bot",
        content: {
          text: {
            text: "Error occured. please check the problem.",
          },
        },
      };
      dispatch(saveMessage(conversation));
    }
  };

  const eventQuery = async (event) => {
    // we need to take care of the message chatbot sent
    const eventQueryVariables = {
      event,
    };
    try {
      // i will send request to the text Query route

      const response = await Axios.post("/api/dialogflow/eventQuery", eventQueryVariables);
      //   console.log("try: ", response);
      for (let content of response.data.fulfillmentMessages) {
        let conversation = {
          who: "bot",
          content: content,
        };
        dispatch(saveMessage(conversation));
      }
    } catch (error) {
      let conversation = {
        who: "bot",
        content: {
          text: {
            text: "Error occured. please check the problem.",
          },
        },
      };
      dispatch(saveMessage(conversation));
    }
  };

  const keyPressHandler = (e) => {
    if (e.key === "Enter") {
      if (!e.target.value) {
        return alert("you need to type something first");
      }
      //we will send request to text query route
      textQuery(e.target.value);

      e.target.value = "";
    }
  };
  // if (!e.target.value) {
  //   return alert("you need to type something first");
  // }

  // //we will send request to text query route
  // e.target.value = "";

  const renderCards = (cards) => {
    return cards.map((card, i) => <Card key={i} cardInfo={card.structValue} />);
  };

  const renderOneMessage = (message, i) => {
    console.log("message", message);
    // we need to separate messge

    if (message.content && message.content.text && message.content.text.text) {
      return <Message key={i} who={message.who} text={message.content.text.text} />;
    } else if (message.content && message.content.payload.fields.card) {
      const AvatarSrc = message.who === "bot" ? <Icon type="robot" /> : <Icon type="smile" />;

      return (
        <div>
          <List.Item style={{ padding: "1rem" }}>
            <List.Item.Meta
              avatar={<Avatar icon={AvatarSrc} />}
              title={message.who}
              description={renderCards(message.content.payload.fields.card.listValue.values)}
            />
          </List.Item>
        </div>
      );
    }
    // template for normal text

    // template for card message
  };

  const renderMessage = (returnMessages) => {
    if (returnMessages) {
      return returnMessages.map((message, i) => {
        return renderOneMessage(message, i);
      });
    } else {
      return null;
    }
  };

  return (
    <div
      style={{
        height: 700,
        width: 700,
        border: "3px solid black",
        borderRadius: "7px",
      }}
    >
      <div style={{ height: 644, width: "100%", overflow: "auto" }}>{renderMessage(messagesFromRedux)}</div>

      <input
        style={{
          margin: 0,
          width: "100%",
          height: 50,
          borderRadius: "4px",
          padding: "5px",
          fontSize: "1rem",
        }}
        placeholder="Send a message..."
        onKeyPress={keyPressHandler}
        type="text"
      />
    </div>
  );
}

export default Chatbot;
