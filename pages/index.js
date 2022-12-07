/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-target-blank */
import { React, useCallback, useEffect, useMemo, useState } from "react";
import PopUp from "public/shared/PopUp";
import WayLog from "public/shared/WayLog";
import { LEFT_GRADIENT, RIGHT_GRADIENT } from "public/util/colors";
import TextNoLabel from "public/shared/TextNoLabel";
import QrButton from "public/shared/QrButton";
import BgBlueButton from "public/shared/BgBlueButton";
import BigText from "public/shared/BigText";
import router from "next/router";
import LineWithText from "public/shared/LineWithText";
import { db } from "src/firebase";
import { ref, child, get } from "firebase/database";
import { isEmpty } from "public/util/functions";
import { hidden, show, successIcon, failIcon } from "public/util/popup";
import { messagesError, messagesSuccess } from "public/util/messages";
import { useDispatch } from "react-redux";
import { incognitoEvent } from "public/redux/actions";
import Logo from "public/shared/Logo";

export default function Index() {
  const BG_COLOR =
    "bg-gradient-to-tr from-[#C8EFF1] via-[#B3D2E9] to-[#B9E4A7]";

  const [pin, setPin] = useState("");
  const [textState, setTextState] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHidden, setHidden] = useState(hidden);

  var [event, setEvent] = useState({});

  const showMethod = useCallback((message, isTrue) => {
    setTextState(message);
    setIsSuccess(isTrue);
    setHidden(show);
  }, [])

  const onJoinClick = useCallback(() => {
    if (isEmpty(pin)) {
      showMethod(messagesError.E2002, false);
      return;
    }
    get(child(ref(db), "event/")).then((snapshot) => {
      const record = snapshot.val() ?? [];
      const values = Object.values(record);
      var currEvent = values.find((item) => item.pinCode === pin);
      if (currEvent === undefined) {
        showMethod(messagesError.E2004, false);
        return;
      }
      setEvent(currEvent);
      showMethod(messagesSuccess.I0008(currEvent.title), true);
      setTimeout(() => {
        router.push("/event/info");
      }, 1000);
    });
  }, [pin, showMethod]);

  //Call dispatch from redux
  const dispatch = useDispatch();

  /* Export current event to redux for another access */
  useEffect(() => {
    dispatch(incognitoEvent(event));
  }, [dispatch, event])

  /*localStorage is here to track what has been saved*/
  useEffect(() => {
    window.localStorage.setItem('EVENT_JOINED_STATE', JSON.stringify(event));
  }, [event]);

  console.log({ pin })

  const pinData = useCallback(
    (e) => {
      setPin(e?.target?.value);
    }, [setPin]
  );

  const closePopup = useCallback(
    () => {
      setHidden(hidden);
    }, []
  );

  const renderLogo = useMemo(() => {
    return (
      <Logo />
    )
  }, [])

  const renderTitle = useMemo(() => {
    return (
      <BigText font=" text-2xl" text="Mã pin sự kiện" />
    )
  }, [])

  const renderInput = useMemo(() => {
    return (
      <TextNoLabel
        type="text"
        id="idRoom"
        placeholder="Mã pin"
        onChange={pinData}
      />
    )
  }, [pinData])

  const renderButton = useMemo(() => {
    return (
      <div className="w-full mb-4">
        <BgBlueButton content="Tham gia" onClick={onJoinClick} />
      </div>
    )
  }, [onJoinClick])

  const renderLine = useMemo(() => {
    return (
      <LineWithText
        text="hoặc"
        leftColor={LEFT_GRADIENT}
        rightColor={RIGHT_GRADIENT}
      />
    )
  }, [])

  const renderDirect = useMemo(() => {
    return (
      <div className="mt-10">
        <WayLog
          action="Đăng nhập"
          title="để quản lý sự kiện?"
          path="/auth/login"
        />
        <WayLog
          action="Đăng ký"
          title="để tạo tài khoản."
          path="/auth/register"
        />
      </div>
    )
  }, [])

  const renderPopUp = useMemo(() => {
    return (
      <div className={isHidden}>
        <PopUp
          text={textState}
          icon={isSuccess ? successIcon : failIcon}
          close={closePopup}
          isWarning={!isSuccess}
        />
      </div>
    )
  }, [closePopup, isHidden, isSuccess, textState])

  return (
    <section
      className={`h-screen mx-auto flex justify-center items-center ${BG_COLOR}`}
    >
      <div
        className={`flex flex-col justify-center items-center max-w-xl w-4/5 h-full `}
      >
        {renderLogo}
        {renderTitle}
        {renderInput}
        {renderButton}
        {renderLine}
        <QrButton onClick={() => alert("Please scan a QR code to join.")} />
        {/* Handle logic todo: go direct to open device's camera */}
        {renderDirect}
      </div>
      {renderPopUp}
    </section>
  );
}
