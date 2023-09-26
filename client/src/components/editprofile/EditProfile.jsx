import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import "./editprofile.css";
import { Close as CloseIcon } from "@material-ui/icons";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import InputLabel from "@mui/material/InputLabel";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EditProfile({ onClose }) {
  const { user, dispatch } = useContext(AuthContext);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [previewProfilePicture, setPreviewProfilePicture] = useState(null);
  const [newUsername, setNewUsername] = useState(user.username);
  const [newPassword, setNewPassword] = useState("");
  const [newCity, setNewCity] = useState(user.city);
  const [newFrom, setNewFrom] = useState(user.from);
  const [newRelationship, setNewRelationship] = useState(user.relationship);
  const [newStudies, setNewStudies] = useState(user.studies);
  const [newWork, setNewWork] = useState(user.work);
  const [newBirthdate, setNewBirthdate] = useState(
    user.birthdate ? new Date(user.birthdate) : null
  );
  const formattedBirthdate = newBirthdate
    ? newBirthdate.toISOString().split("T")[0]
    : null;
  const [isPasswordEditingEnabled, setIsPasswordEditingEnabled] =
    useState(false);
  const history = useHistory();

  function formatDate(date) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`/users?userId=${user._id}`);
        setNewPassword(res.data.password);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user._id]);

  const handleProfilePictureChange = (e) => {
    const selectedFile = e.target.files[0];
    setNewProfilePicture(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewProfilePicture(imageUrl);
  };

  const handleTogglePasswordEditing = () => {
    setIsPasswordEditingEnabled(!isPasswordEditingEnabled);
  };

  const handleUpdateProfile = async () => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to update your profile. Do you want to proceed?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
      });

      if (confirmed.isConfirmed) {
        if (newProfilePicture) {
          const data = new FormData();
          data.append("file", newProfilePicture);
          await axios.post(`/upload/profilePicture/${user._id}`, data);
        }
        const updatedUserData = {
          userId: user._id,
          username: newUsername,
          password: newPassword,
          city: newCity,
          from: newFrom,
          relationship: newRelationship,
          studies: newStudies,
          work: newWork,
          birthdate: formattedBirthdate,
        };
        const res = await axios.put(`/users/${user._id}`, updatedUserData);
        dispatch({ type: "UPDATE", payload: res.data });
        const changedFields = [];
        if (newUsername !== user.username) changedFields.push("Name");
        if (isPasswordEditingEnabled && newPassword !== "") {
          changedFields.push("Password");
        }
        if (newProfilePicture) changedFields.push("Profile Picture");
        if (newCity !== user.city) changedFields.push("Lives in");
        if (newFrom !== user.from) changedFields.push("From");
        if (newStudies !== user.studies) changedFields.push("Studies");
        if (newWork !== user.work) changedFields.push("Work");
        if (newRelationship !== user.relationship)
          changedFields.push("Relationship");
        if (formattedBirthdate !== user.birthdate)
          changedFields.push("Birthdate");
        const successMessage =
          changedFields.length > 0
            ? `Your ${changedFields.join(", ")} has been updated successfully!`
            : "Credentials Updated";
        Swal.fire({
          title: "Credentials Updated",
          text: successMessage,
          icon: "success",
        });
        history.push("/");
        onClose();
        dispatch({ type: "LOGOUT" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (previewProfilePicture) {
        URL.revokeObjectURL(previewProfilePicture);
      }
    };
  }, [previewProfilePicture]);

  //Countries List
  const countries = [
    "Select a country",
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua & Deps",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cape Verde",
    "Central African Rep",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Congo {Democratic Rep}",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "East Timor",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland {Republic}",
    "Israel",
    "Italy",
    "Ivory Coast",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea North",
    "Korea South",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macedonia",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar, {Burma}",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russian Federation",
    "Rwanda",
    "St Kitts & Nevis",
    "St Lucia",
    "Saint Vincent & the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome & Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Togo",
    "Tonga",
    "Trinidad & Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  return (
    <div className="editProfile">
      <div className="closeButton" onClick={onClose}>
        <CloseIcon />
      </div>
      <h2>Edit Profile</h2>
      <div className="editProfileForm">
        <div className="editProfileItem">
          <label htmlFor="profilePicture" className="uploadLabel">
            <InputLabel
              htmlFor="profilePicture"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CloudUploadIcon className="cloudicon" />
              Upload Profile Picture
            </InputLabel>
          </label>
          <input
            type="file"
            id="profilePicture"
            accept=".png,.jpeg,.jpg"
            onChange={handleProfilePictureChange}
            style={{ display: "none" }}
          />
          {previewProfilePicture && (
            <img
              src={previewProfilePicture}
              alt="Preview Profile Picture"
              className="previewProfilePicture"
            />
          )}
        </div>

        <div className="editProfileItem">
          <label>Name</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>

        <div className="editProfileItem">
          <div className="passwordInput">
            <input
              placeholder="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!isPasswordEditingEnabled}
              className={!isPasswordEditingEnabled ? "disabledInput" : ""}
            />
            <div
              className="passwordIcons"
              onClick={handleTogglePasswordEditing}
            >
              {isPasswordEditingEnabled ? <LockOpenIcon /> : <LockIcon />}
            </div>
          </div>
        </div>

        <div className="editProfileItem">
          <label>Work</label>
          <input
            type="text"
            value={newWork}
            onChange={(e) => setNewWork(e.target.value)}
          />
        </div>
        <div className="editProfileItem">
          <label>Studies</label>
          <input
            type="text"
            value={newStudies}
            onChange={(e) => setNewStudies(e.target.value)}
          />
        </div>
        <div className="editProfileItem">
          <label>Lives in</label>
          <select value={newCity} onChange={(e) => setNewCity(e.target.value)}>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div className="editProfileItem">
          <label>From</label>
          <input
            type="text"
            value={newFrom}
            onChange={(e) => setNewFrom(e.target.value)}
          />
        </div>
        <div className="editProfileItem">
          <label>Birthdate</label>
          <DatePicker
            selected={newBirthdate}
            onChange={(date) => setNewBirthdate(date)}
            dateFormat="MM/dd/yyyy"
            isClearable
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Select a date"
            value={newBirthdate ? formatDate(newBirthdate) : ""}
          />
        </div>
        <div className="editProfileItem">
          <label>Relationship</label>
          <select
            value={newRelationship}
            onChange={(e) => setNewRelationship(e.target.value)}
          >
            <option value={1}>Single</option>
            <option value={2}>Married</option>
            <option value={3}>In a relationship</option>
          </select>
        </div>
      </div>
      <div className="editProfileButtons">
        <button className="editProfileButton" onClick={handleUpdateProfile}>
          Save
        </button>
      </div>
    </div>
  );
}
