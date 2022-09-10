import "./Snackbar.css";
import React from "react";


const Snackbar = ({ closeSnackBar, message }) => {
    return (
        <div className="error-container">
            <div className="error-child-container">
                <div className="error-logo" onClick={closeSnackBar}></div>
                <div className="error-message">{message}</div>
            </div>
        </div>
    )
}

export default Snackbar;
