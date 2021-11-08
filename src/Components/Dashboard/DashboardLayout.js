import React, { props, useState } from 'react'

import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import './DashboardLayout.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export const DashboardLayout = () => {

      return(
            <div className="main-container">
                  <div className="main-title-dashboard">d a s h <span style={{color: 'rgba(52, 152, 219, 1)'}}>b o a r d</span></div>
                  <div className="main-add-new">add <span style={{fontWeight: '1000'}}>new one</span></div>
                  <div className="dashboard-grid">
                  
                        <DashboardItemNormal bookCoverImageUrl="https://i0.wp.com/szczere-recenzje.pl/wp-content/uploads/2014/03/Kamienie-na-szaniec.jpg?fit=500%2C739"/>
                        <DashboardItemNormal />
                        <DashboardItemNormal />
                        <DashboardItemNormal />
                        <DashboardItemNormal />
                        <DashboardItemNormal />
                  

                  </div>
            </div>
      );
}



export const DashboardItemNormal = ({ bookCoverImageUrl }) => {

      const [buttonDisplay, setButtonDisplay] = useState("not-displayed");

      const showButton = e => {
            e.preventDefault();
            setButtonDisplay("displayed");
      };

      const hideButton = e => {
            e.preventDefault();
            setButtonDisplay("not-displayed");
      };


      return(
            
            <div className="dashboard-item-1"
                  onMouseEnter={e => showButton(e)}                  
                  onMouseLeave={e => hideButton(e)} 

                  style={{ backgroundImage: {bookCoverImageUrl} }}
            >
                  
                  <div className={buttonDisplay}>
                        <div className="dashboard-button-1">
                              <FontAwesomeIcon icon={ faPen }/>
                              
                        </div>
                        <div className="dashboard-button-1" style={{marginLeft: '2.5rem'}}> 
                              <FontAwesomeIcon icon={ faTrash }/> 
                        </div>
                  </div>
            </div>
      );
}

export const DashboardAddMenu = (props) => {

      return(
            <div className="dashboard-add-menu">
                  
                  <div className="dashboard-add-menu-wrapper">
                        ALLELUJA
                  </div>

            </div>
      );
}