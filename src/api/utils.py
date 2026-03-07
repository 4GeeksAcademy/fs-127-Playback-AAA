from flask import jsonify, url_for
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request


class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""+links_html+"</ul></div>"


def require_role(*roles):
    """Restringe el acceso a usuarios con alguno de los roles indicados.
    Uso: @require_role("admin") o @require_role("admin", "seller")
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            from api.models.user import User
            user = User.query.get(get_jwt_identity())
            if not user or not user.role:
                return jsonify({"error": "Sin rol asignado"}), 403
            if user.role.value not in roles:
                return jsonify({"error": "Acceso denegado"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def require_permission(permission_name):
    """Restringe el acceso a usuarios que tengan el permiso indicado.
    Uso: @require_permission("product:create")
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            from api.models.user import User
            user = User.query.get(get_jwt_identity())
            if not user or not user.role:
                return jsonify({"error": "Sin permisos"}), 403
            if permission_name not in user.get_permissions():
                return jsonify({"error": f"Permiso requerido: {permission_name}"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator