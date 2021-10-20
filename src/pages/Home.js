import "./home.scss";
import { useEffect, useState, useRef } from "react";
import { useLocation, useHistory } from "react-router";
import Axios from "axios";
import Snackbar from "../components/snackbar";

//Date (react-datepicker)
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";

//Slider (Slick)
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

//Images
import planBase from "../assets/images/plan-base.svg";
import logo from "../assets/images/syntralis logo.svg";
import moment from "moment";

const Main = () => {
	const location = useLocation();
	const history = useHistory();
	// Load Screen
	const loader = document.getElementById("loader");

	function showLoader() {
		loader.style.animation = "loaderFadeIn .5s forwards";
	}
	function hideLoader() {
		loader.style.animation = "loaderFadeOut .5s forwards";
	}

	var user = { iduser: 0, username: "", name: "", sexe: "", password: "" };

	if (location.state) {
		user = location.state.user;
	}

	// #region Snackbar
	const snackbarRef = useRef(null);
	const [snackbarSuccess, setSnackbarSuccess] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const snackbarMessageType = {
		reserved: "Successfully reserved",
		deleted: "Successfully deleted",
		alreadyReserved:
			"Sorry, this table is already reserved on that date and hour",
		networkError: "Error, check your internet connection",
		otherError: "Error: something went wrong.",
	};

	const [processing, setProcessing] = useState(false);

	//#endregion

	const logout = () => {
		Axios.post("https://syntralis.herokuapp.com/logout", {
			logout: true,
		})
			.then((response) => {
				if (response.data.success) {
					showLoader();
					history.replace("/");
				}
			})
			.catch((error) => {
				if (error) {
					setSnackbarSuccess(false);
					console.log(error);
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
	const deleteAccount = () => {
		Axios.post("https://syntralis.herokuapp.com/deleteaccount", {
			userID: user.iduser,
		}).then((response) => {
			if (response.data.success) {
				showLoader();
				history.replace("/");
			}
		});
	};

	document.body.style.background = "#232323";
	document.body.style.display = "block";
	document.getElementById("root").style.height = "100%";

	const sliderSettings = {
		autoplay: true,
		autoplaySpeed: 5000,
		pauseOnHover: false,
		dots: true,
		infinite: true,
		speed: 1500,
		fade: true,
	};

	const [logoutStatus, setLogoutStatus] = useState(false);
	const toggleLogout = () => {
		setLogoutStatus(!logoutStatus);
	};

	//#endregion

	// Plan
	//#region RESERVATION
	const ref = useRef(null);
	const scrollToPlan = () => {
		ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const [activeTable, setActiveTable] = useState(0);
	const chooseTable = (id) => {
		setActiveTable(id);
		setFilter(0);
	};

	const [filter, setFilter] = useState(0);
	const filterTables = (a) => {
		filter == a ? setFilter(0) : setFilter(a);
	};

	const [tableList, setTableList] = useState([
		{ number: 0, capacity: 0, cost: 0 },
	]);
	const getTables = () => {
		Axios.get("https://syntralis.herokuapp.com/table-data").then((response) => {
			var a = response.data;
			a.splice(0, 0, { number: 0, capacity: 0, cost: 0 });
			var tables = a;
			setTableList(tables);
		});
	};

	const heureOuverture = 8;
	const heureFermeture = 20;

	const calculateCost = () => {
		var end = parseInt(heureE);
		var start = parseInt(heureS);
		var length = end - start;
		var costPH = parseInt(tableList[activeTable].cost);
		setTableCost(length * costPH);
	};
	// Data to use in reservation
	const [date, setDate] = useState(null);
	const [heureS, setHeureS] = useState(0);
	const [heureE, setHeureE] = useState(0);
	const [tableCost, setTableCost] = useState(0);

	const [showDispo, setShowDispo] = useState(false);
	const getDispo = () => {
		setShowDispo(!showDispo);
	};

	const resetPopup = () => {
		setActiveTable(0);
		setDate(null);
		setHeureS(0);
		setHeureE(0);
		setTableCost(0);
		setShowDispo(false);
		setCheck_availability(false);
	};

	const reserve = () => {
		Axios.post("https://syntralis.herokuapp.com/reserve", {
			table: activeTable,
			date: moment(date).format("DD-MM-YYYY"),
			start: parseInt(heureS),
			end: parseInt(heureE),
			cost: parseInt(tableCost),
			idUser: parseInt(user.iduser),
		})
			.then((response) => {
				var success = response.data.success;
				var alreadyReserved = response.data.alreadyReserved;
				setSnackbarSuccess(success);
				if (success) {
					setSnackbarMessage(snackbarMessageType.reserved);
					resetPopup();
				} else {
					if (alreadyReserved) {
						setSnackbarMessage(snackbarMessageType.alreadyReserved);
						checkAvailability();
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

	const [check_availability, setCheck_availability] = useState(false);
	const [rTime, setRTime] = useState([{ startTime: 0, endTime: 0 }]);
	const [allDay, setAllDay] = useState(false);
	const checkAvailability = () => {
		Axios.post("https://syntralis.herokuapp.com/availability", {
			table: activeTable,
			date: moment(date).format("DD-MM-YYYY"),
		})
			.then((response) => {
				var success = response.data.success;
				var _rTime = response.data.rTime;
				var _allDay = response.data.allDay;
				setRTime(_rTime);
				setAllDay(_allDay);
				if (success) {
					setShowDispo(true);
					setCheck_availability(true);
				} else {
					setSnackbarMessage(snackbarMessageType.otherError);
					setSnackbarSuccess(success);
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
				setProcessing(false);
			});
	};

	//#endregion

	//#region ADMIN
	const [admin_result, setAdmin_result] = useState([
		{ numTable: 0, date: "", startTime: 0, endTime: 0, cost: 0, idUser: 0 },
	]);
	const [admin_noResult, setAdmin_noResult] = useState(true);
	const getAdminResult = () => {
		Axios.get("https://syntralis.herokuapp.com/get-reservation")
			.then((response) => {
				setAdmin_result(response.data.result);
				setAdmin_noResult(response.data.noRes);
			})
			.catch((error) => {
				if (error) {
					setSnackbarSuccess(false);
					console.log(error);
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

	const deleteData = (idUser, date, startTime) => {
		Axios.post("https://syntralis.herokuapp.com/delete", {
			idUser: idUser,
			date: date,
			start: startTime,
		})
		.then((response) => {
			var success = response.data.success;
			setSnackbarSuccess(success);
			if (success) {
				setSnackbarMessage(snackbarMessageType.deleted);
				getAdminResult();
			} else {
				setSnackbarMessage(snackbarMessageType.otherError);
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
	}

	//#endregion

	useEffect(() => {
		showLoader();
		setTimeout(() => {
			hideLoader();
		}, 1000);
		if (user.iduser === 0) {
			history.replace("/");
		}
		if (user.username == "admin") {
			getAdminResult();
		} else getTables();
	}, []);

	// UI
	return (
		<div className="home">
			<div className="header w-100">
				<div className="container">
					<a href="/home" className="logo">
						<img src={logo} alt="logo"></img>
					</a>
					<div className="navs w-100 justify-content-center">
						<button href="index.html" className="nav-item active">
							Accueil
						</button>
					</div>
					<div className="buttons" onClick={toggleLogout}>
						<button className="btn user grn">{user.username}</button>
						<div
							className="more"
							style={
								logoutStatus
									? { animation: "fadeIn .3s forwards" }
									: { animation: "fadeOut .3s forwards" }
							}
						>
							<button className="logout">Profil</button>
							<button
								className="logout"
								disabled={processing ? true : false}
								onClick={() => {
									setProcessing(true);
									logout();
								}}
							>
								Se deconnecter
							</button>
						</div>
					</div>
				</div>
			</div>

			{user.username == "admin" ? (
				<div className="admin">
					<h1>Bienvenue Admin.</h1>
					<div className="list">
						{admin_noResult ? (
							<p className="no-result">Aucune reservation :(</p>
						) : (
							admin_result.map((item) => (
								<p className="admin-item" key={item.index}>
									<div className="num">
										<span>Table numéro:</span>
										<span>{item.numTable}</span>
									</div>
									<div className="date">
										<span>Pour la date:</span>
										<span>{item.date}</span>
									</div>
									<div className="start-time">
										<span>Heure de début:</span>
										<span>{item.startTime}h</span>
									</div>
									<div className="end-time">
										<span>Heure de fin:</span>
										<span>{item.endTime}h</span>
									</div>
									<div className="cost">
										<span>Pour un total de:</span>
										<span>{item.cost} Euros</span>
									</div>
									<div className="idUser">
										<span>Fait par l'utilisateur:</span>
										<span>{item.idUser}</span>
									</div>
									<button className="delete" onClick={() => {
										deleteData(item.idUser, item.date, item.startTime);
									}}>Supprimer</button>
								</p>
							))
						)}
					</div>
				</div>
			) : (
				<div>
					<section className="banner">
						<Slider {...sliderSettings}>
							<div className="slide-item">
								<div className="bg bg2"></div>
								<div className="container h-100">
									<div className="main-content d-flex h-100 w-100 align-items-center">
										<div className="inner">
											<h2 className="font-weight-bold">
												On organise tout !
											</h2>
											<p>
												Lorem, ipsum dolor sit amet consectetur
												adipisicing elit. <br /> Omnis quos enim
												fugit quam eum voluptates magni nam
												necessitatibus odio nulla aliquid esse
												officiis <br /> eligendi veniam, tempore
												soluta consectetur impedit fugiat.
											</p>
											<p className="author">Par Iris</p>
											<div className="buttons d-flex">
												<button
													onClick={scrollToPlan}
													className="btn o"
												>
													Reserver
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="slide-item">
								<div className="bg bg1"></div>
								<div className="container h-100">
									<div className="main-content d-flex h-100 w-100 align-items-center">
										<div className="inner">
											<h2 className="font-weight-bold">
												Essayez notre plateforme !
											</h2>
											<p>
												La vie est trop courte pour decider{" "}
												<br></br> Pleine de mystère pour refuser.
											</p>
											<p className="author">Par Iris</p>
											<div className="buttons d-flex">
												<button
													onClick={scrollToPlan}
													className="btn o"
												>
													Reserver
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="slide-item">
								<div className="bg bg3"></div>
								<div className="container h-100">
									<div className="main-content d-flex h-100 w-100 align-items-center">
										<div className="inner">
											<h2 className="font-weight-bold">
												Venez manger !
											</h2>
											<p>
												Bla bla bla Lorem ipsum dolor sit amet
												consectetur adipisicing elit. <br /> Itaque
												omnis optio ex sit quibusdam libero impedit
												iure doloremque deserunt.
											</p>
											<p className="author">Par Iris</p>
											<div className="buttons d-flex">
												<button
													onClick={scrollToPlan}
													className="btn o"
												>
													Reserver
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Slider>
					</section>
					<div className="main" ref={ref}>
						<div className="container">
							<h2>Plan du resto</h2>
							<span className="cliquez">
								Cliquez pour reserver la table.
							</span>
							<div className="filter">
								<span>Filtrer:</span>
								<button
									onClick={() => {
										filterTables(8);
									}}
								>
									8 places
								</button>
								<button
									onClick={() => {
										filterTables(4);
									}}
								>
									4 places
								</button>
								<button
									onClick={() => {
										filterTables(2);
									}}
								>
									2 places
								</button>
							</div>

							<div className="plan">
								<img src={planBase} alt="plan-base" />
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="plan-filter"
									viewBox="0 0 844 678"
								>
									<rect className="a bg" width="844" height="678" />
									<rect
										className="b fg"
										style={
											filter != 0
												? { opacity: ".6" }
												: { opacity: "0" }
										}
										x="14.64"
										y="13.72"
										width="815.04"
										height="583.2"
									/>
									<text
										className="d"
										transform="translate(139.02 117.98)"
									>
										<tspan className="e">0</tspan>
										<tspan x="12.05" y="0">
											2
										</tspan>
									</text>
									<text
										className="d"
										transform="translate(309.88 165.5)"
									>
										<tspan className="f">0</tspan>
										<tspan x="12.08" y="0">
											3
										</tspan>
									</text>
									<text
										className="d"
										transform="translate(99.94 279.98)"
									>
										<tspan className="g">0</tspan>
										<tspan x="11.82" y="0">
											1
										</tspan>
									</text>
									<text
										className="d"
										transform="translate(457.41 55.48)"
									>
										04
									</text>
									<text
										className="d"
										transform="translate(601.89 55.48)"
									>
										05
									</text>
									<text
										className="d"
										transform="translate(745.17 55.48)"
									>
										06
									</text>
									<text
										className="d"
										transform="translate(781.78 157.82)"
									>
										<tspan className="h">0</tspan>
										<tspan x="11.86" y="0">
											7
										</tspan>
									</text>
									<text
										className="d"
										transform="translate(780.98 305.68)"
									>
										08
									</text>
									<text
										className="d"
										transform="translate(648.16 310.42)"
									>
										<tspan className="f">0</tspan>
										<tspan x="12.08" y="0">
											9
										</tspan>
									</text>
									<text
										className="d"
										transform="translate(497.94 310.39)"
									>
										10
									</text>
									<text
										className="d"
										transform="translate(648.16 186.17)"
									>
										12
									</text>
									<text
										className="d"
										transform="translate(497.94 186.14)"
									>
										<tspan className="i">1</tspan>
										<tspan x="9.36" y="0">
											1
										</tspan>
									</text>
									<g>
										<circle
											className={
												"tab " +
												(filter == 8 || activeTable == 1
													? "active"
													: "")
											}
											onClick={() => {
												chooseTable(1);
											}}
											cx="109.24"
											cy="271.59"
											r="49.48"
										/>
										<circle
											className={
												"tab " +
												(filter == 8 || activeTable == 2
													? "active"
													: "")
											}
											id="table2"
											onClick={() => {
												chooseTable(2);
											}}
											cx="149.41"
											cy="110.68"
											r="49.48"
										/>
										<circle
											className={
												"tab " +
												(filter == 8 || activeTable == 3
													? "active"
													: "")
											}
											id="table3"
											onClick={() => {
												chooseTable(3);
											}}
											cx="318.99"
											cy="157.82"
											r="49.48"
										/>
									</g>
									<g>
										<rect
											className={
												"tab " +
												(filter == 2 || activeTable == 4
													? "active"
													: "")
											}
											id="table4"
											onClick={() => {
												chooseTable(4);
											}}
											x="430.98"
											y="26.29"
											width="73.7"
											height="43.23"
											rx="5.19"
										/>
										<rect
											className={
												"tab " +
												(filter == 2 || activeTable == 5
													? "active"
													: "")
											}
											id="table5"
											onClick={() => {
												chooseTable(5);
											}}
											x="575.46"
											y="26.29"
											width="73.7"
											height="43.23"
											rx="5.19"
										/>
										<rect
											className={
												"tab " +
												(filter == 2 || activeTable == 6
													? "active"
													: "")
											}
											id="table6"
											onClick={() => {
												chooseTable(6);
											}}
											x="718.74"
											y="26.29"
											width="73.7"
											height="43.23"
											rx="5.19"
										/>
										<rect
											className={
												"tab " +
												(filter == 2 || activeTable == 7
													? "active"
													: "")
											}
											id="table7"
											onClick={() => {
												chooseTable(7);
											}}
											x="756.59"
											y="127.69"
											width="73.7"
											height="43.23"
											rx="5.19"
											transform="translate(942.74 -644.14) rotate(90)"
										/>
										<rect
											className={
												"tab " +
												(filter == 2 || activeTable == 8
													? "active"
													: "")
											}
											id="table8"
											onClick={() => {
												chooseTable(8);
											}}
											x="756.59"
											y="275.89"
											width="73.7"
											height="43.23"
											rx="5.19"
											transform="translate(1090.95 -495.93) rotate(90)"
										/>
									</g>
									<g>
										<rect
											className={
												"tab " +
												(filter == 4 || activeTable == 9
													? "active"
													: "")
											}
											id="table9"
											onClick={() => {
												chooseTable(9);
											}}
											x="627.43"
											y="273.49"
											width="59.66"
											height="59.66"
											rx="7.87"
											transform="translate(406.99 -375.91) rotate(45)"
										/>
										<rect
											className={
												"tab " +
												(filter == 4 || activeTable == 10
													? "active"
													: "")
											}
											id="table10"
											onClick={() => {
												chooseTable(10);
											}}
											x="479.59"
											y="273.49"
											width="59.66"
											height="59.66"
											rx="7.87"
											transform="translate(363.69 -271.37) rotate(45)"
										/>
										<rect
											className={
												"tab " +
												(filter == 4 || activeTable == 11
													? "active"
													: "")
											}
											id="table11"
											onClick={() => {
												chooseTable(11);
											}}
											x="479.59"
											y="147.25"
											width="59.66"
											height="59.66"
											rx="7.87"
											transform="translate(274.42 -308.35) rotate(45)"
										/>
										<rect
											className={
												"tab " +
												(filter == 4 || activeTable == 12
													? "active"
													: "")
											}
											id="table12"
											onClick={() => {
												chooseTable(12);
											}}
											x="627.43"
											y="147.25"
											width="59.66"
											height="59.66"
											rx="7.87"
											transform="translate(317.73 -412.89) rotate(45)"
										/>
									</g>
								</svg>
							</div>
						</div>

						<div
							className="popup"
							style={
								activeTable == 0
									? { visibility: "hidden", opacity: "0" }
									: { visibility: "visible", opacity: "1" }
							}
						>
							<form
								className="bloc"
								onSubmit={(e) => {
									e.preventDefault();
									reserve();
								}}
							>
								<span
									className="abort"
									onClick={() => {
										resetPopup();
									}}
								></span>
								<h3 className="title">Reservation de {user.name}</h3>
								<div className="field num">
									<div className="name">Table numéro:</div>
									<div className="value">
										{tableList[activeTable].number}
									</div>
								</div>
								<div className="info">
									<div className="field">
										<div className="name">Nombre de place:</div>
										<div className="value">
											{tableList[activeTable].capacity}
										</div>
									</div>
									<div className="field">
										<div className="name">Coût par heure:</div>
										<div className="value">
											{tableList[activeTable].cost} Euros
										</div>
									</div>
								</div>
								<div className="field">
									<div className="name">Quand ?</div>
									<div className="value">
										<DatePicker
											className="date"
											selected={date}
											minDate={addDays(new Date(), 1)}
											onChange={(_date) => {
												setDate(_date);
												setShowDispo(false);
												setCheck_availability(false);
											}}
											dateFormat="dd-MM-yyyy"
											placeholderText="Selectionnez une date"
											required
										></DatePicker>
									</div>
								</div>
								<div className="field h">
									<div className="h-dispo">
										<div className="name">À quelle heure ?</div>
										<span
											className={showDispo ? "active" : ""}
											onClick={() => {
												if (!check_availability)
													checkAvailability();
												else getDispo();
											}}
										>
											Disponibilité ?
										</span>
									</div>
									<div className="heureS">
										<div className="name">De: </div>
										<div className="value">
											<input
												type="number"
												min={heureOuverture}
												max={heureFermeture}
												value={heureS}
												onChange={(e) => {
													var a = e.target.value;
													if (a > heureFermeture)
														a = heureFermeture;
													if (a < heureOuverture)
														a = heureOuverture;
													e.target.value = a;
													setHeureS(a);
													var end = parseInt(heureE);
													var start = parseInt(a);
													var length = end - start;
													var costPH = parseInt(
														tableList[activeTable].cost
													);
													var total = length * costPH;
													if (total > 0) {
														setTableCost(total);
													}
												}}
												required
											/>
											<span>Heure</span>
										</div>
									</div>
									<div className="heureE">
										<div className="name">Jusqu'à: </div>
										<div className="value">
											<input
												type="number"
												min={parseInt(heureS) + 1}
												max={heureFermeture}
												value={heureE}
												onChange={(e) => {
													var a = e.target.value;
													if (a < heureOuverture)
														a = heureOuverture;
													if (a > heureFermeture)
														a = heureFermeture;
													e.target.value = a;
													setHeureE(a);
													var end = parseInt(a);
													var start = parseInt(heureS);
													var length = end - start;
													var costPH = parseInt(
														tableList[activeTable].cost
													);
													var total = length * costPH;
													if (total > 0) {
														setTableCost(total);
													}
												}}
												required
											/>
											<span>Heure</span>
										</div>
									</div>
								</div>
								<div className="field">
									<div className="name">Coût total:</div>
									<div className="cost">{tableCost} Euros</div>
								</div>
								<button className="submit">
									Placer ma reservation
								</button>
							</form>
							<div
								className={"dispo-bloc " + (showDispo ? "active" : "")}
							>
								<div className="title">Disponibilité</div>
								{allDay ? (
									""
								) : (
									<p>Cette table est prise en ces heures:</p>
								)}
								{allDay ? (
									<p>Cette table est libre toute la journée.</p>
								) : (
									rTime.map((item) => (
										<p className="item" key={item.index}>
											- De {item.startTime} heures à {item.endTime}{" "}
											heures
										</p>
									))
								)}
								{allDay ? (
									""
								) : (
									<p>Veuillez prendre les autres heures.</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
			<Snackbar
				ref={snackbarRef}
				type={snackbarSuccess ? "success" : "fail"}
				message={snackbarMessage}
			/>
		</div>
	);
};

export default Main;
