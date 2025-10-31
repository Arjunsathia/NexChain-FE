import { useContext } from "react";
import { RoleContext } from "./RoleContext";

const useRoleContext = () => useContext(RoleContext);

export default useRoleContext;
