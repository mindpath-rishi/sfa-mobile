import { useHeader } from "@/shared/contexts/HeaderContext";
import CheckInScreen from "app/checkin";
import { useEffect } from "react";

export default function index() {
    const { setHeader } = useHeader();

  // useEffect(() => {
  //   setHeader({
  //     title: 'Create Top-up',
  //     showBack: true,
  //     showMenu: false,
  //     showFilter: true
  //   });
  // }, []);

  return <CheckInScreen />;
}
