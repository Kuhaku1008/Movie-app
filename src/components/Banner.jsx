import IconRating from "../assets/rating.png";
import IconRatingHalf from "../assets/rating-half.png";
import anh from "../assets/anh.png";
import IconPlay from "../assets/play-button.png";

const Banner = () => {
  return (
    <div className="w-full h-[700px] bg-banner bg-center bg-no-repeat bg-cover mt-[70px] relative">
      <div className="absolute w-full h-full bg-black opacity-30 top-0 left-0" />
      <div className="w-full h-full flex items-center justify-center space-x-[30px] p-4 relative z-20">
        <div className="flex flex-col space-y-5 items-baseline w-[50%]">
          <p className="text-white bg-gradient-to-r from-red-600 to-red-300 text-md py-2 px-3">Phim mới</p>
          <div className="flex flex-col space-y-4">
            <h2 className="text-white text-3xl">Tết ở làng địa ngục</h2>
            <div className="flex items-center space-x-3">
              <img src={IconRating} alt="rating" className="w-8 h-8" />
              <img src={IconRating} alt="rating" className="w-8 h-8" />
              <img src={IconRating} alt="rating" className="w-8 h-8" />
              <img src={IconRating} alt="rating" className="w-8 h-8" />
              <img src={IconRatingHalf} alt="rating" className="w-8 h-8" />
            </div>
            <p className="text-white text-lg">
              Bộ phim truyền hình được chuyển thể từ tiểu thuyết cùng tên của nhà văn Thảo Trang, gồm 12 tập.
              Phim xoay quanh những cái chết kỳ dị, man rợ xuất hiện ngày càng nhiều ở làng Địa Ngục - nơi nương náu hiện giờ của con cháu băng cướp khét tiếng một thời trong quá khứ.
            </p>
            
          </div>
        </div>
        <div className="w-[50%]">
        <div className="w-[500px] h-[600px] translate-x-20 relative group">
            <img src={anh} alt="anh" className="w-full h-full object-cover" />
            <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100">
              <img src={IconPlay} alt="play" className="w-16 h-16 " />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
