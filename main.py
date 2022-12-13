import requests
from flask import Flask, render_template, request, make_response
from requests import Response
from typing import List
from PIL import Image


def send_image(endpoint: str, image_path: str) -> Response:
    """
    Sends an image to a raspberry pi endpoint running:
        https://github.com/A1029384756/ai_tv_rpi

    Parameters
    ----------
    endpoint : str
        The IP address of the http endpoint (i.e. localhost, 192.x.x.x)
    image_path : str
        A path to the image on disk

    Returns
    -------
    Response : the result of the http requests
    """
    url: str = f'http://{endpoint}:7978/setImage'
    file: dict = {'image': open(image_path, 'rb')}
    response: Response = requests.post(url, files=file)
    return response


def send_prompt(endpoint: str, prompt: str) -> Response:
    """
    Send a prompt to Axibo Stable Diffusion endpoint

    Parameters
    ----------
    endpoint : str
        The IP address of the Stable Diffusion endpoint
    prompt: str
        The prompt to provide to Stable Diffusion

    Returns
    -------
    Response : the result of the request to Axibo
    """
    info: dict = {'prompt': prompt}
    response: Response = requests.post(endpoint, json=info)
    return response


def split_img(image: Image, horz_strips: int) -> List[Image]:
    """
    Take an input image and splits it into a specified
    number of vertical strips

    Parameters
    ----------
    image : Image
        The image to split into strips, this image remains
        unmodified
    horz_strips : int
        The number of vertical strips to split the image into

    Returns
    -------
    List[Image] : a list containing each image strip
    """
    result: List[Image] = []

    w, h = image.size()
    strip_width: int = w / horz_strips
    curr_crop: int = 0

    while (curr_crop + strip_width < w):
        result.append(image.crop(curr_crop, 0, curr_crop + strip_width, h))
        curr_crop += strip_width
    return result


def main():
    app = Flask(__name__, static_url_path='')

    @app.route('/')
    def main_page():
        return render_template('index.html')

    @app.route('/sendText', methods=['POST'])
    def send_text():
        prompt: str = request.json['prompt']
        print(prompt)
        response = make_response("<h1>Success</h1>", 201)
        return response

    app.run(host='localhost', port=5876)


if __name__ == "__main__":
    main()
