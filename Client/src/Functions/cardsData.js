const cardsShape = {
  box: [1, 2, 3, 5, 7, 10, 11, 13, 14],
  circle: [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14],
  cross: [1, 2, 3, 5, 7, 10, 11, 13, 14],
  star: [1, 2, 3, 4, 5, 7, 8],
  Triangle: [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14],
};

export const cardImages = {};
export const cardData = {};

Object.keys(cardsShape).forEach((shape) => {
  cardsShape[shape].forEach((num) => {
    cardImages[`${shape}${num}`] = new Image();
    cardData[`${shape}${num}`] = {
      name: `${shape}${num}`,
      shape: shape,
      number: num,
    };
    cardImages[`${shape}${num}`].src = `/Resources/${shape}${num}.png`;
  });
});
