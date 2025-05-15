package com.aquarian.drivers.ui.home;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProviders;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

import com.aquarian.drivers.R;
import com.aquarian.drivers.util.GlobalVariables;
import com.aquarian.drivers.util.SaveData;
import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

//import static com.google.android.gms.internal.zzagr.runOnUiThread;
import android.os.Handler;
import android.os.Looper;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import android.location.Location;

public class HomeFragment extends Fragment implements OnMapReadyCallback {

    private TextView dashJobs;
    GoogleMap map;
    MapView mapView;
    int zoom;
    private FusedLocationProviderClient fusedLocationClient;

    private ActivityResultLauncher<String[]> locationPermissionLauncher;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_home, container, false);
        final TextView dashDate = root.findViewById(R.id.dashDate);
        final TextView dashUser = root.findViewById(R.id.homeUser);
        dashUser.setText("Жүргізуші: " + ((GlobalVariables) getContext().getApplicationContext()).getDriverFirstname());
        dashJobs = root.findViewById(R.id.dashJobs);
        final TextView dashWeather = root.findViewById(R.id.dashWeather);
        final TextView dashLastCon = root.findViewById(R.id.dashLastCon);
        dashJobs.setText("Жұмыстар\n\n" + numberOfJobs() + " жұмыс бүгін қалды");
        dashDate.setText("Жұмыс күні\n\n" + getDate());
        scheduleUpdateLocation(dashWeather, this.getContext());
        dashLastCon.setText("Соңғы қосылым\n\n" + ((GlobalVariables) getContext().getApplicationContext()).getDriverLastConnection());
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity());

        zoom=4;
        mapView = (MapView) root.findViewById(R.id.mapView);
        mapView.onCreate(savedInstanceState);
        mapView.getMapAsync(this);
        Button mapFocusButton = (Button) root.findViewById(R.id.buttonMapFocus);
        mapFocusButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                focusMap();
            }
        });

        locationPermissionLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestMultiplePermissions(),
                result -> {
                    boolean fineLocationGranted =
                            result.containsKey(Manifest.permission.ACCESS_FINE_LOCATION) &&
                                    Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_FINE_LOCATION));

                    boolean coarseLocationGranted =
                            result.containsKey(Manifest.permission.ACCESS_COARSE_LOCATION) &&
                                    Boolean.TRUE.equals(result.get(Manifest.permission.ACCESS_COARSE_LOCATION));

                    if (fineLocationGranted || coarseLocationGranted) {
                        enableMyLocation();
                    } else {
                        Log.w("HomeFragment", "Location permission denied.");
                    }
                }
        );


        return root;
    }

    private void requestLocationPermission() {
        locationPermissionLauncher.launch(new String[] {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
        });
    }

    private void enableMyLocation() {
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            map.setMyLocationEnabled(true);
        }
    }

    private int numberOfJobs() {
        //Read JSON string from internal storage.
        SaveData sd = new SaveData();
        sd.read("jobsFile", getActivity().getApplicationContext());
        //Parse JSON string and create objects
        try {
            JSONArray response = new JSONArray(sd.content); //Parse JSON Array
            return response.length();
        } catch (JSONException ex) {
            Log.e("App", "Failure", ex);
            return 0;
        }
    }

    private String getDate() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("EEEE dd MMMM");
        try {
            Date date = Calendar.getInstance().getTime();
            String dateTime = dateFormat.format(date);
            return dateTime;
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public Handler handler = new Handler();
    private final int ONE_MINUTE = 10000;
    private Runnable runnableCode;

    public void scheduleUpdateLocation(TextView t, Context c) {
        getWeather(t,c);
        handler.postDelayed(runnableCode = new Runnable() {
            public void run() {
                try {
                    getWeather(t,c);
                    dashJobs.setText("Жұмыстар\n\n" + numberOfJobs() + " j");
                } catch (Exception ex) {
                    Log.d("HomeFragment (line 86)", "Schedule Weather Update: " + ex.toString());
                }
            }
        }, ONE_MINUTE);
    }

    public void removeHandler()
    {
        Log.i("Stop Handler ","Yes");
        handler.removeCallbacks(runnableCode);
    }

    private void getWeather(TextView t, Context c)
    {
        try
        {
            if (((GlobalVariables) c.getApplicationContext()).getWeather() != null)
            {
                String weather = ((GlobalVariables) c.getApplicationContext()).getWeather();
                JSONObject jsonobject = new JSONObject(weather); //Parse JSON object
                String weatherPrint = "Today's weather in " + jsonobject.getString("name") + "\n\n";
                JSONArray jarray = jsonobject.getJSONArray("weather");
                jsonobject = jarray.getJSONObject(0);
                weatherPrint += jsonobject.getString("description").substring(0, 1).toUpperCase() +  jsonobject.getString("description").substring(1) + "\n";
                jsonobject = new JSONObject(weather);
                jsonobject = jsonobject.getJSONObject("main");
                weatherPrint += "Temperature: " + Math.round(Double.parseDouble(jsonobject.getString("temp"))) + "ºC";
                t.setText(weatherPrint);
            }
        }
        catch (JSONException ex)
        {
            Log.d("JSON Exception", ex.toString());
        }
    }

    private void focusMap() {
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestLocationPermission();
            return;
        }

        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(location -> {
                    if (location != null && map != null) {
                        LatLng userLocation = new LatLng(location.getLatitude(), location.getLongitude());
                        zoom = (zoom == 4) ? 15 : 4;
                        CameraUpdate cameraUpdate = CameraUpdateFactory.newLatLngZoom(userLocation, zoom);
                        map.animateCamera(cameraUpdate);
                    } else {
                        Log.w("HomeFragment", "Location is null");
                    }
                })
                .addOnFailureListener(e -> Log.e("HomeFragment", "Failed to get location", e));
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        map = googleMap;
        map.getUiSettings().setMyLocationButtonEnabled(false);

        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            map.setMyLocationEnabled(true);
        } else {
            requestLocationPermission(); // ✅ Новый способ
        }

        LatLng userLocation = new LatLng(
                ((GlobalVariables) getContext().getApplicationContext()).getLatitude(),
                ((GlobalVariables) getContext().getApplicationContext()).getLongitude()
        );
        CameraUpdate cameraUpdate = CameraUpdateFactory.newLatLngZoom(userLocation, zoom);
        map.animateCamera(cameraUpdate);
    }



    @Override
    public void onResume() {
        mapView.onResume();
        super.onResume();
    }


    @Override
    public void onPause() {
        super.onPause();
        mapView.onPause();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mapView.onDestroy();
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        mapView.onLowMemory();
    }
}
