export default class Route {
  constructor(url, title, pathHtml, authorize, pathJS = "") {
    this.url = url;
    this.title = title;
    this.pathHtml = pathHtml;
    this.pathJS = pathJS;
    this.authorize = authorize;
  }
}
/*
  [] -> Tout le monde peut accéder à la route
  ["disconnected"] -> Tout le monde sauf les utilisateurs connectés
  ["admin"] -> Seuls les utilisateurs avec le rôle admin
  ["driver"] -> Seuls les utilisateurs avec le rôle conducteur
  ["passenger"] -> Seuls les utilisateurs avec le rôle passager
  ["driverPassenger"] -> Seuls les utilisateurs avec les rôles conducteur et passager
  ["employed"] -> Seuls les utilisateurs avec le rôle employé
  
  */
