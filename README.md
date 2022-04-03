# EV and Chill: server
[Link to EV and Chill client repository](https://github.com/jon-cundiff/EVandChill-client)

## Purpose of the app:

Allows users to find electric vehicle charging stations nearby or along their road trip route by searching for a city/zip code. Because of the time involved with charging an electric vehicle, our app also provides recommendations for nearby food, entertainment, and stores.

## How to use:

### Perform a search:

- Search by location, zip code, or city/state (allow location access if searching by location)
- Search can be performed in the top menu or in the hamburger menu (select Stations Near Me)

#### Search Results Page

This page displays a list of stations sorted by distance and a Google map showing the position of individual charging stations. The location of your search is denoted by the red crosshair in the middle of the map.

Search results are stored in the database and if the requested search is less than 24 hours old, the results will be pulled from our database. If the search parameters are older than 24 hours or not in the database, the [Open Charge Map API](https://openchargemap.org/site/develop/api#/) will be called. 

Select a station from the list to zoom in on its location. The station icon can then be selected to view basic information about the station such as station title, address, type of connections, contact information, and operating hours. To view more information about a station, click the View Details button.

#### Station Details Page

The station details page displays more in-depth inofrmation about a charging station specifically regarding plug types and speed. Users can also add a station to their list of favorites (click the heart icon next to the station title) or leave a review about the station to help inform users whether or not a station is operational. Note that you must be registered and logged in to add a favorite or review. 

Below the station details and map section, a list of businesses near the stations are displayed. The businesses are separated into three categories: food, entertainment, and stores. Select a business to be redirected to its Google maps page. 

#### Registration and Login

Users can create an account with a username, email address, and password. Upon registration and login, users can add stations to their favorites list and add station reviews. A guest login is also implemented with sample favorites and reviews. 

## Live link:  
https://evandchill.pages.dev/

## Featured technologies: 
React, Redux, node.js, Express, MongoDB, mongoose, axios, jsonwebtoken, bcrypt

## External API:
[Open Charge Map](https://openchargemap.org/site/develop/api#/)

## This site was built by
[Jon Cundiff](https://github.com/jon-cundiff), [Phil Slater](https://github.com/Phil-Slater), [Katie Freeman](https://github.com/katie-freeman)





