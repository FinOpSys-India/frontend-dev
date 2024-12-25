import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import plusIcon from "../../assets/plusIcon.svg";
import micIcon from "../../assets/micIcon.svg";
import sendIcon from "../../assets/sendIcon.svg";
import messageIcon from "../../assets/messageIcon.svg";
import callIcon from "../../assets/callIcon.svg";
import crossButton from "../../assets/crossButton.svg";
import bigCross from "../../assets/bigCross.svg"
import { roles } from "../../utils/constant";
import "./Chat.css";
import { Dropdown, Modal, Table } from "react-bootstrap";
import { apiEndPointUrl } from "../../utils/apiService"
import crop from '../../assets/expandButton.svg';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDropzone } from "react-dropzone";
import io from 'socket.io-client'
import { TextField,Typography,Box, Button} from "@mui/material";
import { spacing } from '@mui/system';



// Connect to the WebSocket server
const socket = io('http://localhost:9000');

function Chat({ caseId, fetchInvoices, closeChat, notDisabledChat, expandInChat}) {
  const [acitivityLogButton, setacitivityLogButton] = useState(true);
  const [chatcaseId, setchatcaseId] = useState("");
  const [showAcceptDecline, setShowAcceptDecline] = useState(false);
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);
  const role = sessionStorage.getItem("role");
  const [chats, setChats] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [socket, setSocket] = useState(null);
  const [showSmallPreview, setShowSmallPreview] = useState(false);
  const [showSmallPreviewTable, setShowSmallPreviewTable] = useState(false);

  const [showAcceptTextBox, setShowAcceptTextBox] = useState(false);
  const [text, setText] = useState("");
  const maxLimit = 100;

  const handleTextChange = (event) => {
    if (event.target.value.length <= maxLimit) {
      setText(event.target.value);
    }
  };
  const MAX_FILE_SIZE = 500 * 1024 * 1024;

  const [file, setFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(new FormData());

  const handleMessageChange = (inputValue) => {
    setNewMessage(inputValue);
    // Show Accept/Decline popup if "/" is entered
    if (
      inputValue.includes("/") &&
      (role == roles.approver1 || role == roles.approver2)
    ) {
      setShowAcceptDecline(true);
    } else {
      setShowAcceptDecline(false);
      setShowSecondaryDropdown(false);
    }
  };

  function acitivityLogClose() {
    setacitivityLogButton(false);
  }
  const acceptClickOnChat=()=>{
    showSmallPreview(true);
    showAcceptTextBox(true);
  }

  const handleAcceptClick = async () => {
    // Call API for Accept action
    try {
      const response = await axios.post(`${apiEndPointUrl}/accept`, {
        invoiceId: caseId, // Replace with the actual invoice ID field
        role: role,
      });
      if (response.status == 500 || response.status == 400) {
        toast.error("Error in accepting invoice !");
      } 
      if(response.status == 200) {
        toast.success('Bill successfully approved', { autoClose: 3000 });
        fetchInvoices();  
        closeChat();
      }
    } catch (error) {
      console.log("Error in accepting invoice:", error.response.data.message);
      toast.error(`${error.response.data.message}`);
    }

    setShowAcceptDecline(false); // Hide popup after Accept
  };


  const handleSecondaryOptionClick = async (option) => {
      try {
      const response = await axios.post(`${apiEndPointUrl}/decline`, {
        invoiceId: caseId, // Replace with the actual invoice ID field
        role: role,
        declineReason:option
      });
      if (response.status === 500 || response.status === 400) {
        toast.error("Status is already approved/ declined !");
      } 
      if(response.status == 200) {
        toast.success(`Bill successfully declined`, { autoClose: 500 });
        fetchInvoices(); 
        closeChat();
      }
    } catch (error) {
      console.log("Error declinedStatus invoice:", error.message);
    }
    setShowSecondaryDropdown(false);
  };


  const handleDeclineClick= ()=> {
    setShowSecondaryDropdown(true);
    setShowAcceptDecline(false);
  }
  

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${apiEndPointUrl}/chats/${caseId}`);
      setChats(response.data);
    } catch (error) {
      console.log("Error fetching chats:", error);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const { errors } = rejectedFiles[0];
      if (errors[0]?.code === "file-too-large") {
        toast.error("File size exceeds 10MB");
      }
    } else if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile); // Store the selected file
      handleDocClick(selectedFile); // Automatically start upload
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    accept:
      "application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg",
  });

  const handleDocClick = async (fileToUpload) => {
    if (!fileToUpload) {
      toast.error("Please select a file to upload.");
      return;
    }

    setFileDetails(fileToUpload);
  };
  const hideSmallPreview=()=>{
    setShowSmallPreview(false);
    setShowSmallPreviewTable(false);
    setShowAcceptTextBox(false);
  }
  const handleSendClick = async () => {
    if (!newMessage.trim() && !fileDetails) {
      return;
    }

    const newChat = {
      chat_id: chatcaseId,
      user: workEmail,
      messages: newMessage,
      timestamp: new Date().toISOString(),
      fileData: fileDetails,
    };
    setNewMessage("");

    try {
      const response = await axios.post(`${apiEndPointUrl}/message`, newChat, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      socket.emit('sendMessage', newChat);  
      setChats((prevChats) => ({
        ...prevChats,
        MESSAGES: [...prevChats.MESSAGES, newChat],
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    }
    fetchChats();
};    

  useEffect(() => {
    let email = document.cookie.split("; ").find((row) => row.startsWith("workEmail="))?.split("=")[1];
    setWorkEmail(email);
    setchatcaseId(caseId)

    fetchChats();



    const newSocket = io('http://localhost:9000');  // Socket connection
    newSocket.on('connect', () => {
    });

    newSocket.on('newMessage', (message) => {
        setChats((prevChats) => ({
            ...prevChats,
            MESSAGES: [...prevChats.MESSAGES, message],
        }));
    });

    // Error handling for socket connection
    newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    // Set socket in state
    setSocket(newSocket);  // Save the socket connection in the state

    // Cleanup function to disconnect the socket on component unmount
    return () => {
        newSocket.disconnect();
    };

  }, [caseId]);



  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();

    const isToday = messageDate.toDateString() === today.toDateString();

    if (isToday) {
      return "Today";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="PendiingBillChat">
      <div className="PendiingBillChatNavbar">
        <div className="billNumberAndpeople">
          <span id="billNoBill">Bill</span>
          <span id="billParticipant">{caseId}</span>
        </div>
        <div className="chatIcon">
          <div className="pendingBillCall">
            <img src={callIcon} style={{ fontSize: "30px" }} />
          </div>
          <img
            className="messageAndCross"
            style={{ fontSize: "19.9px" }}
            src={messageIcon}
          />
          <img
            className="messageAndCross"
            style={{ fontSize: "16px" }}
            src={crossButton}
            onClick={closeChat}

          />
        </div>
      </div>

      <div className="chatContent">
        <div id="chatContainer">
        {showSmallPreview ?<div className="chat-modal-overlay">
            <div className="chat-modal">
              <div className="cross-expand-button">
              
              <button className="close-button" onClick={hideSmallPreview}>
                <img src={bigCross}/>
              </button>
              {!showAcceptTextBox?<button className="close-button" onClick={()=>expandInChat(caseId)}>
              <img src={crop} />
              </button>:null}
              </div>
              {showAcceptTextBox? <div>
                <Typography marginLeft="7%" required style={{
    fontFamily: "Inter", // Apply Inter font
  }} >Please add a note*</Typography>
      <TextField
      id="outlined-textarea"
        value={text}
        onChange={handleTextChange}
        multiline
          rows={4}
        InputProps={{
          style: { padding: '8px', margin:"0% 8%" }, // Adjust height if needed
        }}
        style={{
          width: '100%', // Adjust width here
          margin: '0 auto', // Center if needed
        }}
        required
      />
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'right',
          marginRight: '10%',
          color: text.length === maxLimit ? 'red' : 'inherit',
        }}
      >
        {text.length}/{maxLimit}
      </Typography>
      {text!=""? <button className = "acceptButtonOnModel" 
      style={{
        display: "block", // Ensures it takes up its own line
        marginLeft: "auto", // Pushes the button to the right
        marginRight: "10%", // Adds spacing from the right edge
      }}
      onClick={handleAcceptClick}>Accept</button>:null}
              </div>:null}
              {showSmallPreviewTable ? <div className="mt-1 d-flex flex-column align-items-center">
                  <Table   className="PreviewdescriptionTableInChat">
                    <thead>
                      <tr  className="PreviewdescriptionTheadInChat">
                        <th>Bill Number</th>
                        <th>Rate</th>
                        <th>Qty</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr key=""  className='PreviewdescriptionDataInChat'>
                          <td>invoice.billId</td>
                          <td>invoice.Method</td>
                          <td>invoice.amount</td>
                          <td>invoice.col6</td>
                        </tr>
                        <tr key=""  className='PreviewdescriptionDataInChat'>
                          <td>invoice.billId</td>
                          <td>invoice.Method</td>
                          <td>invoice.amount</td>
                          <td>invoice.col6</td>
                        </tr>
                        <tr key=""  className='PreviewdescriptionDataInChat'>
                          <td>invoice.billId</td>
                          <td>invoice.Method</td>
                          <td>invoice.amount</td>
                          <td>invoice.col6</td>
                        </tr>
                    </tbody>
                  </Table>
                </div>:null}
                </div>
          </div>:null}
          {chats?.MESSAGES.map((chat, index) => {
            const currentDate = new Date(chat.timestamp).toDateString();
            const previousDate =
              index > 0 ? new Date(chats.MESSAGES[index - 1]?.timestamp).toDateString() : null;
          
            // Show date only if it's the first message or the date changes
            const showDate = index === 0 || currentDate !== previousDate;

            return (
              <React.Fragment key={index}>
               
                {/* Render the date once per day */}
                {showDate && (
                  <h6 className="chatDay">{formatTimestamp(chat.timestamp)}</h6>
                )}

                {chat.user === workEmail ? (
                  // Sender's chat
                  <div className="personChatDetail">
                    <div className="chatNameAndPic">
                      {/* <img className='chatNameAndPic' src='https://img.freepik.com/premium-vector/default-avatar-profile-silhouette-vector-illustration_561158-3408.jpg' /> */}
                    </div>

                    <div>
                      <div className="messageAndTime">
                        <span className="personName">{chat.user}</span>
                        <div className="personMessageAndTime">
                          <span className="personMessage">{chat.messages}</span>
                          <span>
                            {" "}
                            {chat.fileData && chat.fileData.path ? (
                              <img
                                src={`data:image/jpeg;base64,${chat.fileData}`}
                                alt="file"
                                onError={() =>
                                  console.log("Image failed to load")
                                }
                                style={{ width: "200px", height: "auto" }}
                              />
                            ) : (
                              ""
                            )}
                          </span>

                          <span className="messageTime">
                            {new Date(chat.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Receiver's chat
                  <div className="reciverPersonChatDetail">
                    <div className="reciverChatNameAndPic">
                      {/* <img className='reciverChatNameAndPic' src='https://img.freepik.com/premium-vector/default-avatar-profile-silhouette-vector-illustration_561158-3408.jpg' /> */}
                    </div>

                    <div>
                      <div className="reciverMessageAndTime">
                        <span className="reciverPersonName">{chat.user}</span>
                        <div className="reciverPersonMessageAndTime">
                          <span className="reciverPersonMessage">
                            {chat.messages}
                          </span>
                          <span className="reciverMessageTime">
                            {new Date(chat.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
          
        </div>
        {showAcceptDecline ? (
          <div>
          <Dropdown className="chatdropdownContainerApproveDecline">
          <Dropdown.Item
              eventKey="previewBill"
              onClick={()=>{setShowAcceptDecline(false);setShowSmallPreview(true);setShowSmallPreviewTable(true)}}
              className="chatDropdownEachItem"
            >  &nbsp;&nbsp; Preview
            </Dropdown.Item>
            <Dropdown.Item
              eventKey="acceptBills"
              onClick={()=>{setShowAcceptDecline(false);setShowSmallPreview(true);setShowAcceptTextBox(true)}}
              className="chatDropdownEachItem"
            >
             ✓   &nbsp;&nbsp; Accept
            </Dropdown.Item>
            <Dropdown.Item
              eventKey="declineBills"
              onClick={handleDeclineClick}
              className="chatDropdownEachItem"
            >
              ✕ &nbsp;&nbsp;  Decline
            </Dropdown.Item>
          </Dropdown>
          
          </div>
        ) : null}
        {showSecondaryDropdown && (
        <Dropdown className="chatdropdownContainerDecline">
          <Dropdown.Item
            eventKey="incorrectDetails"
            onClick={() => handleSecondaryOptionClick("Incorrect Details")}
            className="chatDropdownEachItem"
          >
            Incorrect Details
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="missingValues"
            onClick={() => handleSecondaryOptionClick("Missing Values")}
            className="chatDropdownEachItem"
          >
            Missing Values
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="calculationError"
            onClick={() => handleSecondaryOptionClick("Calculation Error")}
            className="chatDropdownEachItem"
          >
            Calculation Error
          </Dropdown.Item>
          <Dropdown.Item
            eventKey="other"
            onClick={() => handleSecondaryOptionClick("Other")}
            className="chatDropdownEachItem"
          >
            Other
          </Dropdown.Item>
        </Dropdown>
      )}
        {notDisabledChat ? <div className="AllChatIcon">
          <div {...getRootProps()}>
            <img 
              id="plusChat"
              style={{ fontSize: "246px" }}
              src={plusIcon}
              onClick={() => handleDocClick(file)}
            />
          </div> 
          
          
          <input
            type="text"
            placeholder="Type your message"
            className="chatInputField"
            value={newMessage}
            onChange={(e) => handleMessageChange(e.target.value)}
          />
          <div className="micChatIconAndSend">
            {/* <img style={{ fontSize: "27px" }} src={micIcon} /> */}
            <img
              style={{ fontSize: "26px" }}
              src={sendIcon}
              onClick={handleSendClick}
            />
          </div>
        </div>:null}
      </div>
      <ToastContainer />
     </div>
  );
}
export default Chat;
