import "./auth.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import Axios from "axios";
import Particles from "react-particles-js";
import logo from "../assets/images/syntralis logo.svg";
import Snackbar from "../components/snackbar";

const Auth = () => {
	// Custom Styles	
	document.body.style.height = "100vh";
	document.body.style.display = "flex";

	let history = useHistory();
	// Load Screen
	const loader = document.getElementById("loader");

	const showLoader = useCallback(
		(time) => {
			setTimeout(() => {
				loader.style.animation = "loaderFadeIn .5s forwards";
			}, time);
		},
		[loader.style]
	);

	const hideLoader = useCallback(
		(time) => {
			setTimeout(() => {
				loader.style.animation = "loaderFadeOut .5s forwards";
			}, time);
		},
		[loader.style]
	);

	useEffect(() => {
		showLoader(0);
		hideLoader(1000);
		Axios.get("https://syntralis.herokuapp.com/login").then((response) => {
			if (response.data.success) {
				history.replace({
					pathname: "/home",
					state: {
						user: response.data.user[0],
					},
				});
			}
		});
	}, [showLoader, hideLoader, history]);

	// Changement entre Se connecter et S'inscrire
	const [activeSign, setActiveSign] = useState("signIn");
	const switchSign = () => {
		activeSign === "signUp"
			? setActiveSign("signIn")
			: setActiveSign("signUp");
	};

	// Snackbar
	const snackbarRef = useRef(null);
	const [snackbarSuccess, setSnackbarSuccess] = useState(true);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const snackbarMessageType = {
		networkError: "Error, check your internet connection",
		passwordError: "Error: wrong password.",
		noUserError: "Error: user doesn't exist",
		userExistsError: "Error: user already exists",
		otherError: "Error: something went wrong.",
		accountCreated: "Account created successfully",
	};

	const [processing, setProcessing] = useState(false);

	// Register
	//#region
	const [prenomReg, setPrenomReg] = useState("");
	const [usernameReg, setUsernameReg] = useState("");
	const [passwordReg, setPasswordReg] = useState("");
	const [sexeReg, setSexeReg] = useState("M");
	Axios.defaults.withCredentials = true;

	const register = () => {
		Axios.post("https://syntralis.herokuapp.com/signup", {
			username: usernameReg,
			password: passwordReg,
			prenom: prenomReg,
			sexe: sexeReg,
		})
			.then((response) => {
				var success = response.data.success;
				var userExists = response.data.userExists;
				setSnackbarSuccess(success);
				if (success) {
					setSnackbarMessage(snackbarMessageType.accountCreated);
					for (
						let i = 0;
						i < document.querySelectorAll("form input").length;
						i++
					) {
						document.querySelectorAll("form input")[i].value = "";
						document.querySelectorAll("form input")[i].checked = false;
					}
					setActiveSign("signIn");
				} else {
					if (userExists) {
						setSnackbarMessage(snackbarMessageType.userExistsError);
					} else {
						setSnackbarMessage(snackbarMessageType.otherError);
					}
				}
			})
			.catch((error) => {
				if (error) {
					setSnackbarSuccess(false);
					if (!error.response) {
						// Network error
						setSnackbarMessage(snackbarMessageType.networkError);
					} else {
						setSnackbarMessage(snackbarMessageType.otherError);
					}
				}
			})
			.finally(() => {
				snackbarRef.current.show();
				setProcessing(false);
			});
	};
	//#endregion

	// Login
	//#region
	const [usernameLog, setUsernameLog] = useState("");
	const [passwordLog, setPasswordLog] = useState("");

	const login = () => {
		Axios.post("https://syntralis.herokuapp.com/login", {
			username: usernameLog,
			password: passwordLog,
		})
			.then((response) => {
				var success = response.data.success;
				var userExists = response.data.userExists;
				setSnackbarSuccess(success);
				if (success) {
					history.replace({
						pathname: "/home",
						state: {
							user: response.data.user[0],
						},
					});
				} else {
					if (userExists) {
						setSnackbarMessage(snackbarMessageType.passwordError);
					} else {
						setSnackbarMessage(snackbarMessageType.noUserError);
					}
					snackbarRef.current.show();
				}
			})
			.catch((error) => {
				if (error) {
					setSnackbarSuccess(false);
					if (!error.response) {
						// Network error
						setSnackbarMessage(snackbarMessageType.networkError);
					} else {
						setSnackbarMessage(snackbarMessageType.otherError);
					}
					snackbarRef.current.show();
				}
			})
			.finally(() => {
				setTimeout(() => {
					setProcessing(false);
				}, 2500);
			});
	};
	//#endregion

	document.getElementById("root").style.height = "auto";
	// User Interface
	return (
		<div className="auth">
			<Particles
				params={{
					autoPlay: true,
					fullScreen: { enable: true, zIndex: 1 },
					fpsLimit: 30,
					interactivity: {
						detectsOn: "canvas",
						events: {
							onClick: { enable: true, mode: "push" },
							onDiv: {
								enable: false,
							},
							onHover: {
								enable: false,
							},
							resize: true,
						},
					},
					particles: {
						bounce: {
							horizontal: {
								random: { enable: false, minimumValue: 0.1 },
								value: 1,
							},
							vertical: {
								random: { enable: false, minimumValue: 0.1 },
								value: 1,
							},
						},
						collisions: {
							bounce: {
								horizontal: {
									random: { enable: false, minimumValue: 0.1 },
									value: 1,
								},
								vertical: {
									random: { enable: false, minimumValue: 0.1 },
									value: 1,
								},
							},
							enable: false,
							mode: "bounce",
							overlap: { enable: true, retries: 0 },
						},
						color: {
							value: "#ff740d",
						},
						destroy: {
							mode: "none",
							split: {
								count: 1,
								factor: {
									random: { enable: false, minimumValue: 0 },
									value: 3,
								},
								rate: {
									random: { enable: false, minimumValue: 0 },
									value: { min: 4, max: 9 },
								},
								sizeOffset: true,
							},
						},
						links: {
							distance: 40,
							enable: true,
							frequency: 1,
							opacity: 0.8,
						},
						move: {
							angle: { offset: 0, value: 360 },
							attract: {
								distance: 500,
								enable: false,
								rotate: { x: 3000, y: 3000 },
							},
							decay: 0,
							distance: 0,
							direction: "none",
							drift: 0,
							enable: true,
							outModes: {
								default: "out",
								bottom: "out",
								left: "out",
								right: "out",
								top: "out",
							},
							random: false,
							size: false,
							speed: 2,
							straight: false,
							trail: {
								enable: false,
								length: 10,
								fillColor: { value: "#000000" },
							},
							vibrate: false,
							warp: true,
						},
						number: {
							density: { enable: true, area: 800, factor: 2000 },
							limit: 130,
							value: 80,
						},
						opacity: {
							random: { enable: false, minimumValue: 0.1 },
							value: 0.5,
						},
						rotate: {
							random: { enable: false, minimumValue: 0 },
							value: 0,
							animation: { enable: false, speed: 0, sync: false },
							direction: "clockwise",
							path: false,
						},
						shadow: {
							blur: 5,
							color: { value: "#ff740d" },
							enable: true,
							offset: { x: 0, y: 0 },
						},
						shape: { options: {}, type: "circle" },
						size: {
							random: { enable: false, minimumValue: 1 },
							value: { min: 0.1, max: 4 },
							animation: {
								count: 0,
								enable: false,
								speed: 5,
								sync: false,
								destroy: "none",
								minimumValue: 0,
								startValue: "random",
							},
						},
					},
					pauseOnBlur: true,
					pauseOnOutsideViewport: true,
				}}
			/>
			<div className="container">
				<div className={activeSign + " dock"}>
					<a href="/" className="logo">
						<img src={logo} alt="logo" />
					</a>
					<div className="title">
						<h3 className={activeSign === "signIn" ? "active" : ""}>
							Connection
						</h3>
						<h3 className={activeSign === "signUp" ? "active" : ""}>
							Inscription
						</h3>
						<div className="deco"></div>
					</div>
					<button className="arrow-right arrow" onClick={switchSign}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20.031"
							height="38.647"
							viewBox="0 0 20.031 38.647"
						>
							<path
								d="M707,550.951l18.617-18.617L707,513.718"
								transform="translate(-706.293 -513.011)"
								fill="none"
								strokeLinejoin="bevel"
								strokeWidth="2"
							/>
						</svg>
					</button>
					<button className="arrow-left arrow" onClick={switchSign}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20.031"
							height="38.647"
							viewBox="0 0 20.031 38.647"
						>
							<path
								d="M707,550.951l18.617-18.617L707,513.718"
								transform="translate(-706.293 -513.011)"
								fill="none"
								strokeLinejoin="bevel"
								strokeWidth="2"
							/>
						</svg>
					</button>
				</div>
				<div className={"main " + activeSign}>
					<div className="title">
						<h3
							className={activeSign === "signUp" ? "active" : ""}
							onClick={() => {
								setActiveSign("signUp");
							}}
						>
							Inscription
						</h3>
						<span>ou</span>
						<h3
							className={activeSign === "signIn" ? "active" : ""}
							onClick={() => {
								setActiveSign("signIn");
							}}
						>
							Connection
						</h3>
					</div>
					<div className="inner">
						<form
							className="signIn"
							onSubmit={(e) => {
								setProcessing(true);
								e.preventDefault();
								login();
							}}
						>
							<div className="input-item">
								<label htmlFor="logUserName">Nom d'utilisateur</label>
								<input
									type="text"
									required
									id="logUserName"
									placeholder="Entrer votre nom d'utilisateur"
									onChange={(e) => {
										setUsernameLog(e.target.value);
									}}
								/>
							</div>
							<div className="input-item">
								<label htmlFor="logUPassword">Mot de passe</label>
								<input
									type="password"
									minLength={4}
									required
									id="logUPassword"
									placeholder="Entrer votre mot de passe"
									onChange={(e) => {
										setPasswordLog(e.target.value);
									}}
								/>
							</div>
							<button
								className="send"
								disabled={processing ? true : false}
							>
								Se connecter
							</button>
							<p>
								<span>Pas encore de compte ?</span>
								<span
									onClick={() => {
										setActiveSign("signUp");
									}}
								>
									S'inscrire
								</span>
							</p>
						</form>
						<form
							className="signUp"
							onSubmit={(e) => {
								setProcessing(true);
								e.preventDefault();
								register();
							}}
						>
							<div className="input-item">
								<label htmlFor="uUserName">Nom d'utilisateur</label>
								<input
									type="text"
									required
									id="uUserName"
									placeholder="Entrer un nom d'utilisateur"
									onChange={(e) => {
										setUsernameReg(e.target.value);
									}}
								/>
							</div>
							<div className="input-item">
								<label htmlFor="uPrenom">Prénom</label>
								<input
									type="text"
									minLength={3}
									maxLength={12}
									required
									id="uPrenom"
									placeholder="Entrer votre prénom"
									onChange={(e) => {
										setPrenomReg(e.target.value);
									}}
								/>
							</div>
							<div className="input-item">
								<label>Sexe</label>
								<div className="choices">
									<div className="choice">
										<input
											type="radio"
											name="sexe"
											value="M"
											required
											id="uSexeM"
											onClick={() => {
												setSexeReg("M");
											}}
										/>
										<label htmlFor="uSexeM">Male</label>
									</div>
									<div className="choice">
										<input
											type="radio"
											name="sexe"
											value="M"
											required
											id="uSexeF"
											onClick={() => {
												setSexeReg("F");
											}}
										/>
										<label htmlFor="uSexeF">Female</label>
									</div>
								</div>
							</div>
							<div className="input-item">
								<label htmlFor="uPassword">Mot de passe</label>
								<input
									type="password"
									minLength={4}
									required
									id="uPassword"
									placeholder="Entrer un mot de passe"
									onChange={(e) => {
										setPasswordReg(e.target.value);
									}}
								/>
							</div>
							<button
								className="send"
								disabled={processing ? true : false}
							>
								S'inscrire
							</button>
							<p>
								<span>Vous avez déjà un compte ?</span>
								<span
									onClick={() => {
										setActiveSign("signIn");
									}}
								>
									Se connecter
								</span>
							</p>
						</form>
					</div>
				</div>
			</div>
			<Snackbar
				ref={snackbarRef}
				type={snackbarSuccess ? "success" : "fail"}
				message={snackbarMessage}
			/>
		</div>
	);
};

export default Auth;
