import { clsx } from "clsx";

const Message = ({ variant = "info", children }) => {
    const styles = {
        info: "bg-blue-100 text-blue-800 border-blue-200",
        danger: "bg-red-100 text-red-800 border-red-200",
        success: "bg-green-100 text-green-800 border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
        <div className={clsx("p-4 mb-4 text-sm border rounded-lg", styles[variant])} role="alert">
            {children}
        </div>
    );
};

export default Message;
