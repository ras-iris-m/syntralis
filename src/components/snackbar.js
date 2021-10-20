import { useState, forwardRef, useImperativeHandle } from "react";
import "./snackbar.css";

const Snackbar = forwardRef((props, ref) => {
	const [appear, setAppear] = useState(false);
	useImperativeHandle(ref, () => ({
		show() {
			setAppear(true)
         setTimeout(() => {
            setAppear(false)
         }, 3000)
		},
	}));
	return (
		<div
			className={
				"snackbar " +
				(props.type === "success" ? "success" : "fail") +
				(appear ? " show" : " hide")
			}
		>
			<div className="message">{props.message}</div>
		</div>
	);
});

export default Snackbar;
