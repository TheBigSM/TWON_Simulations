from flask import Blueprint
from dotenv import load_dotenv
load_dotenv()
import os
#import mimetypes
#mimetypes.add_type('application/javascript', '.js')
#mimetypes.add_type('text/css', '.css')
blueprint = Blueprint(
    'graphs_blueprint',
    __name__,
    url_prefix=os.getenv("PREFIX"),
    template_folder='templates',
    static_folder='static'
)