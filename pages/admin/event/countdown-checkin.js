import { useCallback, useEffect, useMemo, useState } from "react"
import { QRCodeCanvas } from "qrcode.react/lib"
import { useRouter } from "next/router"

import BgBlueButton from "public/shared/BgBlueButton"
import ButtonAndIcon from "public/shared/ButtonAndIcon"
import Line from "public/shared/Line"
import PinCode from "public/shared/PinCode"
import testCoundown from "public/util/testCountdown"
import PopUpQR from "public/shared/PopUpQR"
import { ShowMethod, hidden, show } from "public/util/popup"
import PopUp from "public/shared/PopUp"
import Title from "public/shared/Title"
import { TEXT } from "public/util/colors"
import PlayerList from "public/shared/PlayerList"
import { messagesError, messagesSuccess } from "public/util/messages"

import { useUserCurrEventHook, usePopUpMessageHook, usePopUpStatusHook, usePopUpVisibleHook } from "public/redux/hooks";

import { useDispatch } from "react-redux"
import { db } from "src/firebase"
import {ref, onValue, query, orderByChild, equalTo} from "firebase/database"


function CountDownCheckIn () 
{
    // router
    const router = useRouter()

    const {
        query: {countdown}
    } = router

    const props = {countdown}
    // dispatch
    const dispatch = useDispatch()
    // eventID
    const beforeID = useUserCurrEventHook()
    const pinCode = beforeID.slice(0,6)

    // state
    const [minutes, setMinutes] = useState(countdown)  // store minutes of countdown
    const [seconds, setSeconds] = useState(0) // store seconds of countdown
    const [qrCodeValue, setQrCodeValue] = useState("")  // sotre qr code value
    const [isHidden, setIsHidden] = useState(hidden) // qr code hidden state
    const [isNavigateHidden, setIsNavigateHidden] = useState(hidden) // pop up navigate hidden state
    const [isActive, setIsActitve] = useState(true)
    const [isStop, setIsStop] = useState(false)
    const [textState, setTextState] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [player, setPlayer] = useState(0)

    const countDownNumber = {
        background: "#3B88C3"
    }

    const zIndex = {
        zIndex: "10",
    }

    const zIndexNaviagte = {
        zIndex: "20",
    }

    // message
    const message = usePopUpMessageHook()
    const visible = usePopUpVisibleHook()
    const status = usePopUpStatusHook()

    // countdown
    useEffect(() =>
    {
        let date = new Date()
        let deadline = date.getTime() + (minutes * 60 * 1000)

        let countdown = null

        if(isActive && isStop === false)
        {
            countdown = setInterval(() => {
                let nowDate = new Date()
                let left = deadline - nowDate


                let nowSeconds = Math.floor((left / 1000) % 60);
                let nowMinutes = Math.floor((left / 1000 / 60) % 60);

                if(nowMinutes === 0 && nowSeconds === 0)
                {
                    clearInterval(countdown)

                    ShowMethod(dispatch, messagesSuccess.I0010, true)

                    setTimeout(() =>
                    {
                        router.push("/adimin/luckyspin")
                    },2000)

                }
                else {
                    setMinutes(nowMinutes)
                    setSeconds(nowSeconds)
                }   
            }, 1000)
        }
        else {
            clearInterval(countdown)
        }

        return () => clearInterval(countdown)
    },[isActive, isStop, dispatch])
    
    // close pop up
    const closePopup = (e) => {
        setIsHidden(hidden);
    };

    // generate qr code
    const generateQRcode = useCallback(() =>
    {
        setQrCodeValue(`http://localhost:3000/event/lucky_spin/${pinCode}`)
        let toggle = document.getElementById("qr_code")
        toggle.style.display = "flex"
        setIsHidden(show)
    },[pinCode])

    // download qr code 
    const handleDownloadQR = () =>
    {
        const qrCodeURL = document.getElementById("qrCode")
        const pngUrl = qrCodeURL
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream")

        let downloadElement = document.createElement("a")
        downloadElement.href = pngUrl
        downloadElement.download = `${pinCode}.png`
        document.body.appendChild(downloadElement)
        downloadElement.click()
        document.body.removeChild(downloadElement)
    }

    // start event
    const handleStartEvent = useCallback(() =>
    {   
        setIsStop(true)

        ShowMethod(dispatch, messagesSuccess.I0010, true)

        setTimeout(() =>
        {
            router.push("/admin/luckyspin")
        }, 2000)
    })

    const renderTitleandH1 = useMemo(() =>
    {
        return (
            <>
                <Title title={"tiệc cuối năm"}/>
                <h1 className="uppercase text-xl py-2 font-bold text-[#004599]">mã pin sự kiện</h1> 
            </>
        )
    },[])

    const renderPinCode = useMemo(() =>
    {
        return (
            <div className="w-4/5 max-w-xl h-[80px] mb-3 flex justify-center items-center">
                <PinCode length={6} value={pinCode} />
            </div> 
        )
    },[])

    const renderButtonQRcode = useMemo(() =>
    {
        return (
            <div className="max-w-xl w-4/5 flex mb-3 drop-shadow-lg">
                <ButtonAndIcon content={"TẠO MÃ QR"} classIcon={"fas fa-qrcode"} colorHex={"#40BEE5"} onClick={generateQRcode}/>
            </div>
        )
    },[generateQRcode])

    const renderQRPopup = useMemo(() =>
    {
        return (
            <div className={isHidden} style={zIndex}>
                <PopUpQR close={closePopup}>
                    <div className="hidden mb-3 justify-center" id="qr_code">
                        <div className="flex justify-center items-center">
                            <div>
                                <QRCodeCanvas id="qrCode" size={120} value={qrCodeValue} />
                            </div>
                            <div className="relative">
                                <i className="fas fa-download text-[20px] ml-3 absolute bottom-0" onClick={handleDownloadQR}></i>
                            </div>
                        </div>
                    </div>
                </PopUpQR>
            </div>
        )
    },[isHidden, handleDownloadQR, pinCode, closePopup, qrCodeValue])

    const renderCountdownTime = useMemo(() =>
    {
        return (
            <div className="flex justify-center max-w-xl w-4/5 mb-3">
                
                <div className="w-[65px] h-[100px] rounded-[10px] mr-1 text-white text-6xl flex justify-center items-center drop-shadow-lg" style={countDownNumber}>
                    {minutes > 9 ? (Math.floor(minutes / 10)) : 0}
                </div>
                <div className="w-[65px] h-[100px] rounded-[10px] mr-1 text-white text-6xl flex justify-center items-center drop-shadow-lg" style={countDownNumber}>
                    {minutes > 9 ? (Math.floor(minutes % 10)) : minutes}
                </div>
                <div className="mr-1 text-6xl flex justify-center items-center">
                    <span className="flex justify-center items-center text-[#3B88C3]">:</span>
                </div>
                <div className="w-[65px] h-[100px] rounded-[10px] mr-1 text-white text-6xl flex justify-center items-center drop-shadow-lg" style={countDownNumber}>
                    {seconds > 9 ? Math.floor(seconds / 10) : 0}
                </div>
                <div className="w-[65px] h-[100px] rounded-[10px] mr-1 text-white text-6xl flex justify-center items-center drop-shadow-lg" style={countDownNumber}>
                    {seconds > 9 ? Math.floor(seconds % 10) : seconds}
                </div>

            </div>
        )
    },[minutes, seconds])

    const renderParticipants = useMemo(() =>
    {
        return (
            <div className="max-w-xl w-4/5 flex justify-between mb-2">
                <p className={`text-[16px] text-[${TEXT}] font-bold self-center text-center`}>Số người tham gia</p>
                <div className="flex">
                    <div className="w-[24px] h-[24px] rounded-[5px] text-white font-bold mr-1 flex justify-center items-center drop-shadow-lg" style={countDownNumber}>
                        {Math.floor(player / 10)}
                    </div>
                    <div className="w-[24px] h-[24px] rounded-[5px] text-white font-bold flex justify-center items-center drop-shadow-lg" style={countDownNumber}>
                        {Math.floor(player % 10)}
                    </div>
                </div>
            </div>
        )
    },[player])

    const renderH1andLine = useMemo(() =>
    {
        return (
            <>
                <h1 className="uppercase text-xl font-bold text-[#004599]">người chơi</h1> 
                <div className="max-w-xl w-4/5 z-0"> <Line /> </div>
            </>
        )
    },[])

    const renderPlayer = useMemo(() =>
    {
        return (
            <div className="max-w-xl w-4/5 max-h-[200px] overflow-x-hidden overflow-y-auto">
                <div className="w-full h-full flex flex-col items-center">
                    <PlayerList listPlayer={testCoundown.player} />
                </div>
            </div>
        )
    },[])

    const renderLine3 = useMemo(() =>
    {
        return (
            <div className="max-w-xl w-4/5 mb-4 z-0"> <Line /> </div>
        )
    },[])

    const renderStartButton = useMemo(() =>
    {
        return (
            <div className="max-w-xl w-4/5 flex justify-center items-center" onClick={handleStartEvent}>
                <div className="w-full mr-1 drop-shadow-lg">
                    <BgBlueButton content={"BẮT ĐẦU"}/>
                </div>
            </div>
        )
    },[handleStartEvent])

    const renderPopup = useMemo(() =>
    {
        return (
            <div className={visible} style={zIndexNaviagte}>
                <PopUp text={message} status={status} isWarning={!status} />
            </div>
        )
    },[status, message, visible])

    return (
        <section className="flex flex-col justify-center items-center h-screen w-screen">
            {renderTitleandH1}
            {/* id room */}
            {renderPinCode}
            {/* qr code */}
            {renderButtonQRcode}
            {renderQRPopup}
            {renderCountdownTime}
            {renderParticipants}
            {renderH1andLine}
            {renderPlayer}
            {renderLine3}
            {renderStartButton}
            {renderPopup}
        </section>
    )
}

export default CountDownCheckIn;