import requests
from requests import Response


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


def main():
    pass


if __name__ == "__main__":
    main()
