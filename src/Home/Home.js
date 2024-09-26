import React, { useEffect, useState, useRef } from "react";
import "./home.css";
import AttachEmailOutlinedIcon from "@mui/icons-material/AttachEmailOutlined";
import CropFreeIcon from "@mui/icons-material/CropFree";
import ChatIcon from "@mui/icons-material/Chat";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Nav, Tab } from "react-bootstrap";
import PersonSetting from "../CompanyDetails/PersonSetting";
import approvalQueuelogo from "../assets/approvalQueue.svg";
import billslogo from "../assets/bills.svg";
import insightslogo from "../assets/insights.svg";
import vendorslogo from "../assets/vendors.svg";
import wiperlogo from "../assets/wip_er.svg";
import wipcclogo from "../assets/wip_cc.svg";
import finopsysBigLogo from "../assets/finopsysBig.svg";
import finopsysSmallLogo from "../assets/finopsysSmall.svg";
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { apiEndPointUrl } from "../utils/apiService";
import AQ from "../AQ/AQ";

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleClose = () => setShowModal(false);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName === activeButton ? null : buttonName);

    if (buttonName === "settings") {
      setShowModal(true);
    }
  };

  const ButtonClick = (buttonName) => {
    setActiveButton(buttonName === activeButton ? null : buttonName);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  axios.defaults.withCredentials = true;

  const logOut = () => {
    localStorage.removeItem("authToken");

    axios
      .get(`${apiEndPointUrl}/logout`)
      .then((res) => {
        console.log(res.data);

        navigate("/login");
        window.location.reload(true);
      })
      .catch((err) => console.log(err));
  };

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="dashboard">
      <div className={`${isCollapsed ? "collapsed" : "sideMenu"} dropdown`}>
        <div className="finopsysLogo">
          {isCollapsed ? (<img
            src={finopsysSmallLogo}
            style={{ width: "3.5rem", height: "2.5rem" }} />) :
            <img
              src={finopsysBigLogo}
              style={{ width: "8rem", height: "7rem" }}
            />
          }
          {isCollapsed ? (<button className="collapseArrow" style={{
            backgroundColor: 'white', borderRadius: "50%", marginLeft: "10px", marginTop: "10px", boxShadow: "0.2px 0.2px grey",
            height: "30px", width: "45px", border: "none",   opacity: "0.6"
          }} onClick={toggleCollapse}> <ArrowForwardIosOutlinedIcon style={{ height: "20px", margin: "10%" }} /> </button>) :
            (<button className="collapseArrow" style={{
              backgroundColor: 'white', borderRadius: "50%", marginLeft: "50px", marginTop: "25px", boxShadow: "0.2px 0.2px grey",
              height: "30px", width: "45%",   opacity: "0.6"
            }} onClick={toggleCollapse}> <ArrowBackIosNewOutlinedIcon style={{ height: "20px", marginTop: "35%" }} />  </button>)}
        </div>

        <div className="AccountPayable">
          {isCollapsed ? (<h6>AP</h6>) : (<h6>Account Payable</h6>)}
          {isCollapsed ? (
            <div className="accountPayableButtonsCollapsed">

              <img src={approvalQueuelogo} style={{ width: "2em", height: "2em" }} onClick={() => handleButtonClick("invoiceQueue")} />
              <br />
              <img src={billslogo} style={{ width: "2em", height: "2em" }} onClick={() => handleButtonClick("credits")} />
              <br />
              <img src={wipcclogo} style={{ width: "2em", height: "2em" }} onClick={() => handleButtonClick("credits")} />
              <br />
              <img src={wiperlogo} style={{ width: "2em", height: "2em" }} onClick={() => handleButtonClick("er")} />
              <br />
              <img src={vendorslogo} style={{ width: "2em", height: "2em" }} onClick={() => handleButtonClick("er")} />
              <br />
              <img src={insightslogo} style={{ width: "2em", height: "2em" }} />
            </div>) : (<div className="accountPayableButtons">
              <button
                className="accountPayableButton"
                onClick={() => handleButtonClick("invoiceQueue")}
              >
                <img
                  src={approvalQueuelogo}
                  style={{ width: "2em", height: "1em" }}
                />
                Approval Queue
              </button>
              <br />
              <button
                className="accountPayableButton"
                onClick={() => handleButtonClick("invoices")}
              >
                {" "}
                <img src={billslogo} style={{ width: "2em", height: "1em" }} onClick={() => handleButtonClick("credits")} />
                Bills
              </button>
              <br />
              <button
                className="accountPayableButton"
                onClick={() => handleButtonClick("credits")}
              >
                {" "}
                <img src={wipcclogo} style={{ width: "2em", height: "1em" }} />
                WIP_CC
              </button>
              <br />
              <button
                className="accountPayableButton"
                onClick={() => handleButtonClick("er")}
              >
                <img src={wiperlogo} style={{ width: "2em", height: "1em" }} />
                WIP_ER
              </button>
              <br />
              <button
                className="accountPayableButton"
                onClick={() => handleButtonClick("er")}
              >
                <img src={vendorslogo} style={{ width: "2em", height: "1em" }} />
                Vendors
              </button>
              <br />
              <button
                className="accountPayableButton"
                onClick={() => handleButtonClick("er")}
              >
                <img src={insightslogo} style={{ width: "2em", height: "1em" }} />
                Insights
              </button>
            </div>)}
        </div>
        <hr />

        <div
          className="dropDownDetails"
          ref={dropdownRef}
        >
          <div
            className="userNameBox"
          >
            <div>
              <img
                className="profilePic"
                src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3408.jpg"
                alt="Profile"
              />
            </div>


            {isCollapsed ? (<div
              className="dropdown-toggle"
              type="button"
              onClick={toggleMenu}
              aria-expanded={isOpen ? "true" : "false"}
            ><span> <ArrowForwardIosOutlinedIcon style={{ height: '50%' }} /></span>            </div>
            ) : (<div
              className="dropdown-toggle"
              type="button"
              onClick={toggleMenu}
              aria-expanded={isOpen ? "true" : "false"}
            ><span>
                User Name <ArrowForwardIosOutlinedIcon style={{ height: '50%' }} /></span>
              <span>abc@finopsys.ai</span>            </div>
            )}


          </div>

          <ul
            className={`dropdown-menu ${isOpen ? "show" : ""}`}
            onClick={toggleMenu}
          >

            <li>
              <h6 style={{ marginTop: "-5%", marginLeft:'-0.5%' }}>abc@finopsys.ai</h6>
              <div className="picAndNameInside">
                <DragIndicatorIcon
                  style={{
                    fontSize: 10,
                    marginTop:"10%"
                  }}
                />
                  <img
                    className="profilePic"
                    id="innerImg"
                    src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3408.jpg"
                    alt="Profile"
                    style={{
                      marginTop:"6%"
                    }}
                  />

                <div className="dropdownNameAndPic">
                  <span style={{ fontSize: "10.5px", fontWeight: "500" }}>User Name
                  </span>
                  <br></br>
                  <span
                    style={{ fontSize: "9.3px", fontWeight: "500" }}
                  >
                    abc@finopsys.ai

                  </span>
                </div>
              </div>
              <hr />
            </li>

            <li>
              <div className="companiesHeader">
                <h6 style={{ marginTop: "-10%" , marginLeft:'-0.5%' }}>Companies</h6>
                <AddCircleOutlineIcon style={{ fontSize: 15, marginTop:'-7%'}} />
              </div>
              <div className="picAndNameCompany">
              <DragIndicatorIcon
                    style={{
                      fontSize: 10,
                      marginTop: "6%",
                    }}
                  />
                  <img
                    id="innerImg"
                    src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3408.jpg"
                    alt="Company"
                  />
                <div className="dropdownNameAndPic" type="button">
                  <span style={{ fontSize: "10.5px", fontWeight: "500" }}>Company Name
                  </span>
                </div>
              </div>
              <hr />
            </li>

            <div style={{marginTop:'-3%'}} className="settingWithLogout">
                <li>
                  <button style={{ fontSize: "10.5px", backgroundColor: "white", border:'none' }} onClick={() => handleButtonClick("settings")}>Settings</button>
                </li>
                <li>
                  <button
                    style={{ fontSize: "10.5px", backgroundColor: "white" , border:'none'}}
                    onClick={logOut}
                  >
                    Logout
                  </button>
                </li>
                </div>
          </ul>
        </div>
      </div>

      <div className="rightMenu">
        <h2> Invoice Queue</h2>

        <div className="navbarInvoice">
          <div
            id="email"
            className={activeButton === "email" ? "connectButton" : ""}
            onClick={() => ButtonClick("email")}
          >
            Email <AttachEmailOutlinedIcon /> <span>39</span>
          </div>

          <div
            id="ocr"
            className={activeButton === "ocr" ? "connectButton" : ""}
            onClick={() => ButtonClick("ocr")}
          >
            OCR <CropFreeIcon /> <span>39</span>
          </div>

          <div
            id="chat"
            className={activeButton === "chat" ? "connectButton" : ""}
            onClick={() => ButtonClick("chat")}
          >
            Chat <ChatIcon /> <span>39</span>
          </div>

          <div
            id="manual"
            className={activeButton === "manual" ? "connectButton" : ""}
            onClick={() => ButtonClick("manual")}
          >
            Manual <CloudUploadIcon /> <span>39</span>
          </div>

          <div id="details">
            <div className="a"></div>
          </div>
        </div>
      </div>
      <AQ></AQ>
      <Modal
        show={showModal}
        onHide={handleClose}
        size="xl"
        style={{ marginTop: "2%", width: "70%", marginLeft: "19%" }}
        scrollable
      >
        <Modal.Body>
          <PersonSetting />
        </Modal.Body>
        {/* <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer> */}
      </Modal>
    </div>
  );
}

export default Home;
