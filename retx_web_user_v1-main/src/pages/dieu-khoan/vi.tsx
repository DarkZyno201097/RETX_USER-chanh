import PageLayout from "@layouts/page";
import { locateSelector } from "@store/locate/locate.slice";
import { routeNames } from "@utils/router";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function PolicyPage() {
    const router = useRouter()
    const {locate} = useSelector(locateSelector)

    useEffect(()=>{
        let lang = localStorage.getItem('locate')
        if (locate == lang)
        router.push(routeNames.policy(lang))
    },[locate])

    return (
        <PageLayout>
            <section
                style={{
                    backgroundImage: 'url(/img/bg-contact.png)',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
                className="content py-5">
                <div className="container">
                    <h3 className="section__title--border-bottom">
                        ĐIỀU KHOẢN SỬ DỤNG
                    </h3>

                    <div className="content--box">
                        <h6>HÃY ĐỌC CÁC ĐIỀU SỬ DỤNG TRANG WEB CẨN THẬN TRƯỚC KHI SỬ DỤNG TRANG WEB NÀY ("TRANG WEB"). ĐIỀU KHOẢN SỬ DỤNG TRANG WEB NÀY ("ĐIỀU KHOẢN SỬ DỤNG ") QUẢN LÝ TRUY CẬP VÀ SỬ DỤNG TRANG WEB NÀY. TRANG WEB CÓ SẴN CHỈ ĐỂ TRUY CẬP VÀ SỬ DỤNG VỚI ĐIỀU KIỆN BẠN ĐỒNG Ý VỚI CÁC ĐIỀU KHOẢN SỬ DỤNG NÊU DƯỚI ĐÂY. NẾU BẠN KHÔNG ĐỒNG Ý VỚI TẤT CẢ CÁC ĐIỀU KHOẢN SỬ DỤNG KHÔNG TRUY CẬP HOẶC SỬ DỤNG TRANG TRANG WEB. BẰNG VIỆC TRUY CẬP HOẶC SỬ DỤNG TRANG WEB, BẠN VÀ TỔ CHỨC BẠN ĐƯỢC ỦY QUYỀN ĐẠI DIỆN ("BẠN" HOẶC "BẠNR") CHO BIẾT THỎA THUẬN CỦA BẠN CHỊU SỰ RÀNG BUỘC VỚI CÁC ĐIỀU KHOẢN SỬ DỤNG.</h6>

                        <h4>1.Tính tư cách Người dùng</h4>
                        <h6>
                            Trang Web được cung cấp bởi RETX và chỉ cung cấp cho các công ty và những cá nhân trên độ tuổi trưởng thành về mặt pháp luật, những người có thể lập được (các) hợp đồng ràng buộc về mặt pháp lý theo luật áp dụng. Nếu Bạn không đủ tư cách, Bạn không được phép sử dụng Trang Web.
                        </h6>

                        <h4>2.Phạm vi Điều khoản sử dụng</h4>
                        <h6>
                            Các điều khoản sử dụng này điều chỉnh việc sử dụng địa chỉ Web và tất cả các ứng dụng, phần mềm, và dịch vụ (gọi là, "Dịch vụ") có sẵn trên địa chỉ Web, trừ các dịch vụ chịu sự điều chỉnh của Hợp đồng riêng. Điều khoản hoặc hợp đồng riêng có thể được áp dụng đối với Dịch vụ hoặc mục khác được cung cấp cho Bạn  trên địa chỉ Web ("Hợp đồng dịch vụ"). Các hợp đồng Dịch vụ đi kèm Các dịch vụ có thể áp dụng hoặc được liệt kê thông qua siêu liên kết đi kèm với các Dịch vụ được áp dụng.
                        </h6>

                        <h4>3.Sửa đổi</h4>
                        <h6>
                            RETX có thể chỉnh sửa hoặc cập nhật các Điều khoản sử dụng vào bất kỳ lúc nào. Việc tiếp tục sử dụng địa chỉ Web sau bất kỳ thay đổi nào đối với các Điều khoản sử dụng có nghĩa là bạn chấp nhận những thay đổi này. Bất kỳ khía cạnh nào của Địa chỉ Web có thể được thay đổi, bổ sung, xoá hoặc cập nhật mà không cần thông báo theo ý muốn của RETX. RETX có thể thay đổi hoặc áp dụng phí đối với sản phẩm và dịch vụ thông qua địa chỉ Web vào bất kỳ lúc nào tùy ý. RETX có thể thiết lập hoặc thay đổi, vào bất kỳ lúc nào, các thông lệ và giới hạn chung liên quan đến các sản phẩm và dịch vụ khác tùy ý.
                        </h6>

                        <h4>4.Điều khoản và Điều kiện Dịch vụ của RETX</h4>
                        <h6>
                            Các điều khoản và điều kiện dịch vụ của RETX (“Điều khoản và Điều kiện Dịch vụ của RETX”) áp dụng cho việc vận chuyển và các dịch vụ liên quan do RETX cung cấp, việc Bạn sử dụng dịch vụ vận chuyển và các dịch vụ liên quan của RETX nhận được thông qua Trang web này, ngoài các điều khoản và điều kiện khác có thể được áp dụng cho giao dịch đó như được quy định trong các Điều khoản Sử dụng Trang web này và (các) Thỏa thuận Dịch vụ. Các Điều khoản và Điều kiện Dịch vụ của RETX được kết hợp vào các Điều khoản Sử dụng này, sao cho tất cả các tham chiếu trong Điều khoản Sử dụng này sẽ được coi là bao gồm Điều khoản và Điều kiện Dịch vụ của RETX, trong phạm vi áp dụng
                        </h6>

                        <h4>5. Thông tin Gửi Qua Trang Web và các Dịch vụ</h4>
                        <h6>
                            Việc Bạn gửi thông tin qua Trang web và Dịch vụ sẽ được điều chỉnh theo các điều khoản Sử dụng này.  Bạn tuyên bố và bảo đảm rằng bất kỳ thông tin nào Bạn cung cấp thông qua Trang web hoặc Dịch vụ vẫn chính xác và đầy đủ, và Bạn sẽ duy trì và cập nhật thông tin đó khi cần.
                            <br />
                            Đối với bất kỳ cá nhân nào mà Bạn cung cấp thông tin cá nhân của họ cho RETX thông qua Trang web và Dịch vụ, Bạn cam kết với RETX rằng Bạn có quyền cung cấp thông tin đó và Bạn đã cung cấp tất cả thông báo cần thiết cũng như nhận được mọi sự đồng ý cần thiết cho việc xử lý những thông tin đó theo Dịch vụ Bạn đang sử dụng.
                        </h6>

                        <h4>6. Giấy phép và Sở hữu</h4>
                        <h6>
                            Bất kỳ và tất cả quyền sở hữu trí tuệ ("Sở hữu Trí tuệ") liên quan đến địa chỉ Web và nội dung ("Nội dung") là tài sản duy nhất của RETX, các chi nhánh và bên thứ ba. Nội Dung được luật bản quyền và luật khác bảo vệ tại Hoa Kỳ và các quốc gia khác. Các thành phần của địa chỉ Web được bảo vệ bởi luật thương mại, bí mật thương mại, luật cạnh tranh không lành mạnh và các luật khác và không được sao chép hoặc bắt chước toàn bộ hoặc bộ phận. Tất cả hình ảnh, biểu trưng, và các nội dung khác xuất hiện trêng trang Web là thương hiệu, thương hiệu dịch vụ hoặc thương mại ("Thương hiệu")của RETX, các chi nhánh hoặc các tổ chức khác đã cấp quyền và giấy phép để sử dụng các Thương hiệu đó và có thể không được sử dụng hoặc can thiệp dưới bất kỳ hình thức nào mà không được sự chấp thuận bằng văn bản của RETX. Nếu không được Các Điều khoản sử dụng cho phép, Bạn không được phép sao chép, tái bản, sửa đổi, cho thuê, cho vay, bán, tạo ra tác phẩm phát sinh từ, tải lên, truyền, hoặc phát tán Sở hữu Trí tuệ của Trang Web dưới bất kỳ hình thức nào mà không được sự đồng ý bằng văn bản của RETX hoặc bên thứ ba. Không được được quy định trong văn bản này, RETX không cấp phép cho bạn hoặc quyền đối với Sở hữu trí tuệ của RETX hoặc bên thứ ba.
                            <br />
                            RETX cấp cho bạn giấy phép hạn chế, cá nhân, không chuyển nhượng được, không cấp lại giấy phép, có thể thu hồi được để (a) truy cập và sử dụng trang Web, Nội dung and Dịch vụ của RETX dưới hình thức do RETX đại diện, và (b) truy cập và sử dụng máy vi tính và mạng RETX được cung cấp trong Trang Web ("RETX Hệ thống") chỉ theo hình thức được RETX cho phép. Ngoại trừ giấy phép hạn chế này, RETX không quan tâm đến các Hệ thống RETX, thông tin hoặc dữ liệu có sẵn thông qua Hệ thống RETX("Thông tin"), Nội dung, Dịch vụ, Trang Web hoặc bất kỳ Tài sản khác nào RETX bằng cách cho phép bạn truy cập trang Web. Nếu không được luật pháp phép hoặc không được quy định trong văn bản này, Bất kỳ phần nào của Nội Dung và/hoặc thông tin được chỉnh sửa, sửa đổi, tái tạo, tái xuất bản, dịch sang bất kỳ ngôn ngữ nào hoặc ngôn ngữ máy máy vi tính nào, truyền đi dưới bất kỳ hình thức nào, bán lại hoặc phân phối lại mà không được sự đồng ý bằng văn bản của RETX. Bạn không thể tạo, bán, chào bán, sửa đổi, tái tạo, hiển thị, công khai, nhập khẩu, phát tán, truyền đi hoặc sử dụng Nội dung dưới bất kỳ hình thức nào mà không được sự cho phép bằng văn bản của RETX.
                        </h6>

                        <h4>7. Giới hạn Sử dụng Trang Web</h4>
                        <h6>
                            Ngoài những hạn chế nêu trong Điều khoản sử dụng, Bạn đồng ý rằng:
                            <br />
                            (a) Bạn không che giấu nguồn gốc thông tin được truyền qua Trang Web.<br />
                            (b) Bạn không đưa thông tin giả mạo trên Trang Web.<br />
                            (c) Bạn sẽ không sử dụng hoặc truy cập bất kỳ dịch vụ, thông tin, ứng dụng hoặc phần mềm có sẵn thông qua Trang Web dưới bất kỳ hình thức mà không được RETX cho phép.<br />
                            (d) Bạn không nhập hoặc tải lên Trang Web bất kỳ thông tin nào liên quan đến vi rút, ngựa thành Tơ roa, sâu, bom thời gian hoặc các ứng dụng lập trình máy tính nhằm mục đích phá hoại, can thiệp, ngăn chăn hoặc tước đoạt bất kỳ hệ thống, Trang Web hoặc thông tin vi phạm quyền Sở hữu Trí tuệ (xác định bên dưới).
                            (e) Một số vùng trên Trang Web bị giới hạn đối với khách hàng của RETX.<br />
                            (f) Bạn có thể không sử dụng hoặc truy cập Trang Web hoặc Hệ thống hoặc Dịch vụ RETX dưới bất kỳ hình thức nào, mà theo RETX, có ảnh hưởng bất lợi đến hoạt động hoặc chức năng của hệ thống, Dịch vụ hoặc Trang Web RETX hoặc can thiệp vào khả năng của bên được cấp phép truy cập Hệ thống, Dịch vụ hoặc Trang Web RETX.<br />
                            (g) Bạn không được tạo hoặc sử dụng kỹ thuật tạo khung để gửi kèm bất kỳ phần nào hoặc khía cạnh nào của Nội dung hoặc Thông tin mà không được sự cho phép bằng văn bản của RETX.<br />
                        </h6>
                    </div>

                </div>
            </section>

        </PageLayout>
    )
}