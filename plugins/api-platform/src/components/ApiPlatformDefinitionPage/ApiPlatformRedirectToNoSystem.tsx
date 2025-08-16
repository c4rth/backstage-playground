import { API_NO_SYSTEM } from "@internal/plugin-api-platform-common";
import { Navigate, useParams } from "react-router-dom";

export const ApiPlatformRedirectToNoSystem = () => {
    const { name } = useParams();
    return <Navigate to={`/api-platform/api/${API_NO_SYSTEM}/${name}`} replace />;
};