import { MagicFormulaScreener } from "@/components/magic-formula/MagicFormulaScreener";
import { useNavigate } from "react-router-dom";

const MagicFormula = () => {
  const navigate = useNavigate();
  
  return <MagicFormulaScreener onBack={() => navigate('/')} />;
};

export default MagicFormula;