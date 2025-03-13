import React from "react";
import Overlay from "./Overlay";
import useModalStore from "../../store/useModalStore";

const RedeemModal = () => {
  const { setRedeemModalOpen, setConfirmModalOpen } = useModalStore();
  const openConfirmModal = () => {
    setRedeemModalOpen(false);
    setConfirmModalOpen(true);
  };
  return (
    <>
      <Overlay />
      <div className="modal">
        <div className="top">
          <h2>Redeem Your Points</h2>
          <img
            src="./close-filled.svg"
            onClick={() => setRedeemModalOpen(false)}
            alt="close"
          />
        </div>
        <div className="content">
          <div className="conversion-rate-wrapper">
            <div className="conversion-rate-title">Conversion Rates</div>
            <div>100 points = 500mb</div>
          </div>
          <div className="converter">
            <div className="title">Points to redeem</div>
            <div className="input-wrapper flex">
              <input type="text" placeholder="100" />
              <div>=500mb</div>
            </div>
            <div className="phone-input-wrapper flex">
              <div className="provider-logo flex">
                <img src="airtel logo.svg" alt="airtel logo" />
                <img src="./chevron-down.svg" alt="chevron-down" />
              </div>
              <input className="input-result" placeholder="Your phone number" />
            </div>
          </div>
          <button
            className="button-main redeem-button"
            onClick={openConfirmModal}
          >
            Redeem Data Reward
          </button>
        </div>
      </div>
    </>
  );
};

export default RedeemModal;
