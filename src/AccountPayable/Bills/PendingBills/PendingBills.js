import React, { useState } from 'react'
import Home from '../../../Home/Home'
import upload from '../../../assets/upload.svg';
import SearchIcon from '@mui/icons-material/Search';
import FilterDrawer from '../../AQ/FilterSection/FilterDrawer'
import { apiEndPointUrl } from "../../../utils/apiService";
import { Table } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";  
import axios from "axios";
import { useEffect } from 'react';
import chat from '../../../assets/chat.svg';
import { ToastContainer, toast } from "react-toastify";
import  "./PendingBills.css";
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';



function PendingBills() {

  const [filters, setFilters] = useState({ dateRange: { from: null, to: null },
    keyword: "",
    amount: { equalTo: "", greaterThan: "", lessThan: "" },
    selectedMethods: [],
    selectedDepartments: [],});

    const [itemsPerPage] = useState(7);  
    const [showPreview, setShowPreview] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activePage, setActivePage] = useState(1);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [currentInvoiceIndex, setcurrentInvoiceIndex] = useState(0);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedItem, setSelectedItem] = useState('Pending Bills');
    const [activeButton, setActiveButton] = useState(null);
    const navigate = useNavigate();

     let index="";


    //  -------------- dropdown-------------
    const handleSelect = (eventKey) => {
      setSelectedItem(eventKey);
    };

    const handleButtonClick = (buttonName) => {
      setActiveButton(buttonName === activeButton ? null : buttonName);
      navigate(`/${buttonName}`); // Navigates to the path based on button name
    };


    //------------------------- Fetch invoices from the backend-------------------
    const fetchInvoices = async (page) => {
      try {
        const response = await axios.get(`${apiEndPointUrl}/get-invoices`, {
          params: { page, itemsPerPage }
        });
        setInvoices(response.data);
        setFilteredData(response.data);
        // console.log(response.data)
      } catch (error) {
        toast.error("Failed to fetch invoices", { autoClose: 1500 });
      }
    };
  
    useEffect(() => {
      fetchInvoices();
    }, []);
    
  
    // --------------------------------preview-----------------------------------
    const handleShowPreview = (invoice, index) =>{ 
      setShowPreview(true);
      setSelectedInvoice(invoice); 
      setcurrentInvoiceIndex(index)
    }




  // -----------------------------Calculate pagination-------------------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);


  const [pageNumber, setPageNumber] = useState(1);
  const itemsPerPage1 = 10; 
  const totalItems = 99;

  const handlePageChange = (event, value) => {
    setPageNumber(value);
    setCurrentPage(value);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);


  
  return (
      <div style={{display:"flex"}}>
          <Home currentPage="billAQButton" />
           
          <div className='AQTab'>
              <div className='AQNavbar'>
                
                <Dropdown onSelect={handleSelect}>
                    <Dropdown.Toggle  id="" className="BillDropDown">
                      {selectedItem} 
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item eventKey="All Bills" onClick={() => handleButtonClick('all-Bills')}>All Bills</Dropdown.Item>
                      <Dropdown.Item eventKey="Decline Bills" onClick={() => handleButtonClick('decline-Bills')}>Decline Bills</Dropdown.Item>
                      <Dropdown.Item eventKey="Approved Bills" onClick={() => handleButtonClick('approved-Bills')}>Approved Bills</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                <div className='BillNavbarSideButtons'> 
                    <div className='BillSearchBar'>
                      <SearchIcon style={{ fontSize: '19px', position: 'absolute', top: '33px', left: '83%',color: 'black', }}/>    
                      <input id="BillNameSearch"  type="text"  className="form-control" placeholder="Search"/>
                    </div> 
                    <button className='BillNavbarExportButton'> <img src={upload}/>Export</button>
                </div>
              </div>

              <div className='filterBillDiv'>
                  <div className=''>
                    uibjllknnknknk
                  </div>

                    <FilterDrawer onApplyFilters={setFilters} />
              </div>

                <div className="mt-4 d-flex flex-column align-items-center outerTableDiv">
                  <Table className="custom-width">
                    <thead>
                      <tr>
                        <th> <input type="checkbox"  />   &nbsp;&nbsp;&nbsp; Bill Number</th>
                        <th>Vendor Name</th>
                        <th>Bill Date</th>
                        <th>Due date</th>
                        <th>Current Approver</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                        {
                          currentItems.map((invoice, index) => (
                            <tr key={invoice.billId}>
                              <td onClick={() => handleShowPreview(invoice, index)}>
                                <input type="checkbox" />{" "}
                                <img
                                  src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3408.jpg"
                                  alt="Vendor Avatar"
                                />
                                &nbsp;&nbsp;&nbsp;{invoice.billId}
                              </td>
                              <td onClick={() => handleShowPreview(invoice, index)}>  {invoice.vendorName}</td>
                              <td onClick={() => handleShowPreview(invoice, index)}>{new Date(invoice.receivingDate).toLocaleDateString()} </td>
                              <td onClick={() => handleShowPreview(invoice, index)}>{new Date(invoice.dueDate).toLocaleDateString()} </td>
                              <td onClick={() => handleShowPreview(invoice, index)}> pending pending</td>
                              <td onClick={() => handleShowPreview(invoice, index)}> {invoice.amount}</td>
                              <td id="">
                                  <img src={chat}/>
                              </td>
                            </tr>
                          ))
                        }
                    </tbody>
                  </Table>
              </div>  
          </div>
    </div>
  )
}

export default PendingBills











// pending and approve tab;e 1