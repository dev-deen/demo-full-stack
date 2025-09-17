import React from "react";
import "../styles/ModalStyle.css"; 

export default function Modal({ isOpen, onClose, Component, componentProps }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} 
      >
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        {Component}
      </div>
    </div>
  );
}
