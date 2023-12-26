import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
import "@reach/combobox/styles.css";
import { StandaloneSearchBox, LoadScript } from "@react-google-maps/api";

const libraries = ['places'];

export default function Places({ setOffice }) {
    const {
      ready,
      value,
      setValue,
      suggestions: { status, data },
      clearSuggestions,
    } = usePlacesAutocomplete();

    console.log({status, data})
  
    const handleSelect = async (val) => {
        setValue(val, false);
        clearSuggestions();
      
        try {
          if (status === "OK" && data.length > 0) {
            getGeocode({ address: val })
            .then((results) => {
                console.log("Geocode results:", results);
                const { lat, lng } = getLatLng(results[0]);
                setOffice({ lat, lng });
            })
            .catch((error) => {
                console.error("Error fetching places:", error);
            });
          } else if (status === "ZERO_RESULTS") {
            // Handle zero results
            console.error("No results found for the given query");
          } else {
            // Handle other error cases
            console.error("Error fetching places:", status);
          }
        } catch (error) {
          console.error("Error in handleSelect:", error);
        }
      };

    const onPlacesChanged = () => {
        // This will be called when the user selects a suggestion
        handleSelect(value);
      };
  
    return (
        <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            libraries={libraries}
        >
            <StandaloneSearchBox
                onPlacesChanged={onPlacesChanged} 
                onLoad={(ref) => console.log(ref)}>
                <input
                    type="text"
                    placeholder="Search"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{ color: 'black' }}
                />
            </StandaloneSearchBox>
        </LoadScript>
    );
}