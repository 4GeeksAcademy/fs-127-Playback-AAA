pip install cloudinary

Cloud name	
dquhl9gby
API key	
169839769738737
API secret	
6QSwMtnfzGh2brYetGnK7HGuEq8

API environment variable	
CLOUDINARY_URL=cloudinary://169839769738737:6QSwMtnfzGh2brYetGnK7HGuEq8@dquhl9gby



en .env he añadido # Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret


Paso dos añadir a app.py
import cloudinary                         
import cloudinary.uploader   

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)
paso 3 routes.py


