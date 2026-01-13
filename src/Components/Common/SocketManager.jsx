import { useSocket } from "@/hooks/useSocket";

const SocketManager = () => {
    // This hook handles connecting to the server and listening for updates
    // It will automatically refresh balance and portfolio when an order is filled.
    useSocket();

    return null;
};

export default SocketManager;
