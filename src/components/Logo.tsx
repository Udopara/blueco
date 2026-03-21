import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

const Logo = ({ size = "md" }: LogoProps) => {
  const { profile } = useAuth();
  let homepage;
  if (!profile){
    homepage = "/";
  }else {
    homepage = profile?.role === "employer" ? "/dashboard" : "/";
  }
  return (
    <Link to={homepage}>
      <i className={`${sizeClasses[size]} font-bold`}>
        Blue<span className="text-primary">Co</span>
      </i>
    </Link>
  );
};

export default Logo;
