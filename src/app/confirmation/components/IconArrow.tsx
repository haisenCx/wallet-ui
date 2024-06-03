import React from 'react'

type Props = {
    src?:string;
}

const IconArrow = (props: Props) => {
  return (
    <div className="relative bottom-[0.7rem] w-9 mr-8 bg-cover flex justify-center items-center ">
                <svg
                  className="absolute left-[50%]"
                  width="12"
                  height="41"
                  viewBox="0 0 12 41"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.46967 40.5303C5.76256 40.8232 6.23744 40.8232 6.53033 40.5303L11.3033 35.7574C11.5962 35.4645 11.5962 34.9896 11.3033 34.6967C11.0104 34.4038 10.5355 34.4038 10.2426 34.6967L6 38.9393L1.75736 34.6967C1.46447 34.4038 0.989593 34.4038 0.696699 34.6967C0.403806 34.9896 0.403806 35.4645 0.696699 35.7574L5.46967 40.5303ZM6.75 40V38.5714H5.25V40H6.75ZM6.75 35.7143V32.8571H5.25V35.7143H6.75ZM6.75 30V27.1429H5.25V30H6.75ZM6.75 24.2857V21.4286H5.25V24.2857H6.75ZM6.75 18.5714V15.7143H5.25V18.5714H6.75ZM6.75 12.8571V9.99999H5.25V12.8571H6.75ZM6.75 7.14285V4.28571H5.25V7.14285H6.75ZM6.75 1.42857V0H5.25V1.42857H6.75Z"
                    fill="white"
                    fill-opacity="0.5"
                  />
                </svg>
                <img className="w-5 absolute left-[38%] " src={props.src} alt="" />
              </div>
  )
}

export default IconArrow