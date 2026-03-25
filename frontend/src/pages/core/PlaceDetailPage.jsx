import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, MapPin, Clock, Banknote, ChevronRight, Plus } from 'lucide-react';

const PLACES_DETAIL_DATA = {
  1: {
    id: 1,
    name: 'Bún Chả Cá Bà Phiến',
    rating: '4.8',
    reviewsCount: '850',
    location: 'Đà Nẵng',
    address: '63 Lê Hồng Phong, Phước Ninh, Hải Châu, Đà Nẵng',
    hours: '06:00 - 22:00',
    phone: '0236 3835 412',
    price: '40.000đ - 65.000đ ($)',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzgyzOHX7pZ1fDwyoVKXbvo7kHfopgZXwFRXamKOYtQ19Y21cB1alB_j9gdCOFNOvyHc1janbb57SF32QIeiq9xbDTxTV-fUd4huPrarRee_AysOoVHcIRAtmoOPWryNloUqTB_cCTsfu6pBG90e5SPj-QxSzEMDwBmIWn-LX51sMiybKCzumMeLPjq2LACfs9LHc7KNFIj_3hTaF0GfUEFALzGDQtiAd2jW-CGx1aHQJlZES9atcF1m3jBBRKgmfAJVbyDz3pcJA',
    description: [
      'Với hơn 30 năm gia truyền, Bún Chả Cá Bà Phiến là điểm dừng chân không thể bỏ qua tại Đà Nẵng. Nước dùng được hầm từ xương cá biển nguyên chất, ngọt thanh tự nhiên kết hợp cùng chả cá dai giòn, đậm đà hương vị miền Trung.',
      'Không gian quán mộc mạc nhưng luôn tấp nập khách nhờ chất lượng món ăn đồng nhất qua nhiều thập kỷ.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2qeB9-B2eIOO4jGTquDvlKIT9aIQaZXuKy-S-dK2SadKUPpz5sBv9LjmUM4xfpgYsKblkzsL3OxxdHyLUkhvPC_RfnqeKcCws7D7gI2hP_s1kysK1TxIdJvrTUyTk3xqpV_WtG1zPaTg7eWYzHynyi6l_W0SRNZ87eu17Tr_4czGi60x2S3XGR5m9uqfCl11ENKCJNzyONDD_3AG0m8oFBHtMkRj5XoGxTL-NKZZSTPVAD2eqKrLgfgk2nXPiw6Md199AKuvw-R8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC-GfKVmi76mAIIZpoCwsnhohyyfzm5J-ebiAKQJSUdlqUCylZhrWA7YazIQkUOwfK1u-gHpTOv6fOpmA3SFN0DHuJ1ZDQLgqqPm_aGfvq7AjlraTKD5YVm5BeYEY9XWpv7TA9ogls1vuKS_N7PuSbcc22NpY8sV7Oi-eVlgUmSOd_4pscqbXJPk3F5hXjWMbdtXV9I6oz2_nJFKsm2H_qapVR8yRr-dsLcMcrv6uys2lhuEdCtrG7Atg1NuD9NMi0mU2jYDXztsOg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ6hNSmNfqgA9XCwHdk0uN5SZ03GhcLlIEgaA97Rcec6vRnyJivwZb555theCNkrcSd6IB7bsK7rda1qbzTUfgb8ge30uCD8RQBcENkCt6O5hRacRtU93YLBrOSJW_rCmQgG356lqmgzeQPdUQ2UcD6jq8wABOWTR4lM92S3IxM1OWcKJIQXkC4XTjsvtsgloM9drpeWh2g2rgpuZXGB2GSebDBKiK6dX_A7Lszq6ugLLKWcItV0J7LsDJ_GEgLIXfrjzc7a9N9Ew'
    ],
    menuList: [
      {
        name: 'Bún Chả Cá Đặc Biệt',
        desc: 'Chả cá chiên, hấp, riêu cua, chả tôm',
        price: '55.000đ',
        icon: 'ramen_dining'
      },
      {
        name: 'Bún Cá Thu/Cá Ngừ',
        desc: 'Cá tươi nguyên lát hầm mềm',
        price: '60.000đ',
        icon: 'set_meal'
      }
    ],
    reviews: [
      {
        user: 'Trần Hoàng',
        time: '3 ngày trước',
        rating: 5,
        content: 'Bún ngon, nước lèo ngọt thanh, quán sạch sẽ dù rất đông khách. Giá cả vô cùng hợp lý cho một bát bún chất lượng như vậy.',
        avatarText: 'TH',
        avatarColor: 'bg-blue-100 text-blue-700'
      },
      {
        user: 'Mai Lan',
        time: '1 tuần trước',
        rating: 4,
        content: 'Chả cá dai ngon, không bị bột. Mọi người nên thử thêm hành tím ngâm của quán nhé, cực bắt vị luôn!',
        avatarText: 'ML',
        avatarColor: 'bg-orange-100 text-orange-700'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnpWXI_A0oRU4Ae37yVtc-kqSTiqFVakIiPCVd7-JyCmT7m4UmdNs0ScGTsXmPsTZ4X6q-yPkM5od30jmi5xpAwtPUGxCn9ymzyNykaR__GRFMyfvdCz7ORZcLAczzKya4MHj90U6cJH3EFgsJAPPqCpiyA_9ltFESUTVH4JImnJnrqjgV8M-5YcsnW0Y8kb-dfBGWGLrCgk5MpK9Jr5DkJgUGAzEBskhXNBOhXzyDLOLHyl81atZeHReS96y2ULG5TnUGLBZ2n7M',
    curatorNote: '"Nên ghé quán vào buổi sáng sớm để thưởng thức nước dùng trong trẻo nhất và chả cá vừa mới ra lò. Đừng quên xin thêm một chút hành chua ngâm để trọn vị Đà Nẵng!"',
    suggestions: [
      {
        name: 'Chè Liên Đà Nẵng',
        rating: '4.3 (2.1k)',
        distance: '500m',
        id: 6,
        img: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Hải sản Năm Đảnh',
        rating: '4.6 (1.5k)',
        distance: '2km',
        id: 5,
        img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  6: {
    id: 6,
    name: 'Chè Liên Đà Nẵng',
    rating: '4.3',
    reviewsCount: '128',
    location: 'Đà Nẵng',
    address: '72 Nguyễn Hoàng, Đà Nẵng',
    hours: '08:00 - 22:00',
    price: '20.000đ - 50.000đ',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjfhQzcQO1uB3OnGX5ihoDkkHLT8g-BRyC5YRM4C34byv1mmj9VnBPuQXcyUHyug4Vdfq46bpCYyHrbLt62Z_O4s5bVv0658PsiRCNoHhlN7jk1jltZPlaboWCVlhAPLeh-6hYZ07dUP18kKe3M6jIQUAFgWndn5G79tPxmbf3KitzswXlC_10zWZ0FbPuzKb5JMKbY1etoiJS0kMgYr51xEAQxPOI06zwn-Ls1Vg3Ou-yHAkqq2-fXBOVcN4UQTY_xP57toZRWfg',
    description: [
      'Nhắc đến ẩm thực Đà Nẵng, không thể không kể đến thương hiệu Chè Liên. Nổi tiếng nhất tại đây chính là món chè Thái sầu riêng trứ danh, sự kết hợp hoàn hảo giữa vị béo ngậy của sầu riêng chín cây, nước cốt dừa thơm lừng và các loại thạch đa dạng. Mỗi bát chè là một bản giao hưởng hương vị nhiệt đới, làm say lòng cả những thực khách khó tính nhất.',
      'Bắt đầu từ một quán nhỏ, Chè Liên đã khẳng định vị thế của mình qua hàng chục năm bằng chất lượng nguyên liệu tươi ngon và công thức độc bản không thể trộn lẫn.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVyvMNeEPGf2tyMLzbt7H88IdhQ08uJjXihyAkOroMhrxljrVSNQJ3_5j6ysH4ZpWcJWiEn3Dck2gfLLk1GgxVVbapdkwkozom9yxWQuyDx5uLV0LvHwZpyljjCjFANlhQ-FgCXWmHVA8EhBxgqC2Xe-3ETzKh6xNAwJloAXeVqPH-xBAi_TicXS3ywtfXh_imtJQOrqvxw7DtGSYGDKjBepn48f9dg3FRPbC13yNjjYfOvlYRHsLIZLNBot7-JHRHCSD6gsQ_9As',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwb3EW22z_MqGOJcCkPTLdYvEm7Xgs2z8N0HiKU0VNcKrzU1mahMep7shIDPu6C-6DUvFS6Wd0_Td262rHoPgvrDknO1sckQW5WqT88DOh_q9b1Rq_l_HPAI50v6lO68H3EACyJlnNbwuTULDuocOIRUDq2PxryKqigEzYt0VtYhXTCjwpm9j5pXVab1H0_Uvg25WLtm3Qm1iE-L1Xo1-oLyjgv5IzTK1-h4_eFZUk4aGShiK2TsiUVVODmQ3JPBTMPoQIB35d0WY',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBfHbpocEmJtTgRvd5e90gP2td-uNZkUsK3gL6HA00Rmku72oNscgWLF_JTsz97VWdnWSlyljC-lIRRYbnnqHEIUWcpjnn_9-UAlvONaKbt5WhyT1GSfi67AlzghRME1Apz6-KP1coCJ0XiGOMXVGeE4tdadMmcr2Or2K2WzCPn9Pls72Sjo-3OB6YvDb6WI5Kgv9-GLmdxOkP3NpVJbLUem1sQ-2VhgvsaFgsG6LujvguIOFtTqyg75a8PrFWULlN7WpatpwYTfUo'
    ],
    menuList: [
      {
        name: 'Chè Thái Sầu Riêng',
        desc: 'Món đặc trưng',
        price: '30.000đ',
        icon: 'icecream'
      }
    ],
    reviews: [
      {
        user: 'Anh Nguyen',
        time: 'Vừa xong',
        rating: 5,
        content: 'Chè sầu ở đây là đỉnh nhất Đà Nẵng rồi. Nước cốt dừa thơm, béo mà không bị ngọt gắt. Phục vụ rất nhanh dù quán cực kỳ đông khách.',
        avatarText: 'AN',
        avatarColor: 'bg-indigo-100 text-indigo-700'
      },
      {
        user: 'Minh Hoàng',
        time: '2 ngày trước',
        rating: 4,
        content: 'Giá cả rất hợp lý cho chất lượng. Ngoài chè thái sầu riêng thì bánh flan ở đây cũng rất đáng thử, mềm mịn và thơm mùi trứng.',
        avatarText: 'MH',
        avatarColor: 'bg-purple-100 text-purple-700'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQQjJnWoGoiyFCZr0PIn3ulS9ngpguZVcpdEq3n7GdubU2jOg0ycDNJnIS7V8QVCu8mJx0M-AgMVqZs07pKxmePECxoomYiD8e3Pg4fNUNpnXgA7xn2mG8IdGL6YuYdLCjAqbwkLEeqqjbqrVT2m8zihGk_JnzFlBFYABPNj0PcqBerCdeKeaa9exm72d2kLQ375v7PaPts7TeFdfRi_P3uDh96N5NmTQX-ViLAFG2_nk0LvKqPXoYnU1LtMQJwpvTeS6wOh2MFX4',
    curatorNote: '"Giảm 10% khi đặt hàng trực tiếp qua SavoryTrip App."',
    suggestions: [
      {
        name: 'Bún Chả Cá Bà Phiến',
        rating: '4.8 (850)',
        distance: '500m',
        id: 1,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzgyzOHX7pZ1fDwyoVKXbvo7kHfopgZXwFRXamKOYtQ19Y21cB1alB_j9gdCOFNOvyHc1janbb57SF32QIeiq9xbDTxTV-fUd4huPrarRee_AysOoVHcIRAtmoOPWryNloUqTB_cCTsfu6pBG90e5SPj-QxSzEMDwBmIWn-LX51sMiybKCzumMeLPjq2LACfs9LHc7KNFIj_3hTaF0GfUEFALzGDQtiAd2jW-CGx1aHQJlZES9atcF1m3jBBRKgmfAJVbyDz3pcJA'
      },
      {
        name: 'Hải sản Năm Đảnh',
        rating: '4.6 (1.5k)',
        distance: '2km',
        id: 5,
        img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  2: {
    id: 2,
    name: 'Phở Thìn Bờ Hồ',
    rating: '4.5',
    reviewsCount: '2k+',
    location: 'Hà Nội',
    address: '61 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    hours: '06:00 - 22:00',
    phone: '+84 24 3828 0000',
    price: '60.000đ - 85.000đ',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTkxdDOYFA2GTlwD0R7v21GVrU4BPXkRNPfr9M8-6GqaO1X9l3nNkPono8jSB4IW4Z0DTLA3wBok73KSJIR_kvcpWofCSP1WEA5NvT4_r6NyVekUSK1pavHF3FGAInJOVwydQEO6I1GCSGWq17S6gSvYTYLaE9f_NXbJcq4sKLDSKUdapSuplgPJwp4U8r2CDi_Y68rYIKWK4MizGGmX9dFaAHtvCaqcOQ9C3oLQ6TtII8fP3RDYgIhNuDzecN0b_CN86UHszn9Y',
    description: [
      'Phở Thìn Bờ Hồ không chỉ là một quán ăn, mà là một mảnh ký ức của Hà Nội. Nằm khiêm tốn trong một con ngõ nhỏ hướng ra Hồ Gươm, quán đã giữ vững công thức nước dùng trong vắt, ngọt thanh từ xương ống được ninh kỹ suốt 12 tiếng. Thịt bò được thái mỏng, chần chín tới, giữ trọn độ mềm và ngọt tự nhiên, kết hợp hoàn hảo cùng sợi phở tươi và hành lá xanh mướt.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuATguMMMF31DFf0aXlG28dq8rU4QFxC4BaS8xiQUcdJHGkgnCtaKPyDMkChO-TVzRlsIxLAq0cUs0CB_Ro-j1hU9iVAjLIhwFuTDvLpGF-1BIC4jqOVfOox04sZt6VrmvcpYJRBwGoNzwTrqetsY8VV09y-ZkPNoQY5n4Z6gSjIYgsEuzM1lhO9VRjrjQubB8m1Ki6fd7IIDbi0xVCxYa5u-NgppS4tvxKiLKWP71FFNamMfBcAFZ3LYpsirtGoeQwysiInSQI0vq0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8vSGNHZqc49AXmWbWhaEg7uHWlei_LnUlknF5JJYPjuBUME_nAryj_FuabcTg1oH4QkoxPdCULY4-Y4nAx6thrpybzyUnoxYmlMJDZBbZGU7F09-0nL_fJTGqM4YUkR62zzTIxjG5QMWFW2U4u1bguhR92O6NFeTRkjwxIbIAyYFkhyIUJSA1ZWa5572k_Qijbpx4cgtqvfF4-E2q_ZK97VK2ZYZ2zowK1RwT3yl2Yh-Yte-PYAZjq4WA-WeH6nBb2x0AVwUgZZU',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCf_sbvUp6C55qn5u2fHwTRiXOAlam0F5nwIY6fvVvCxWH_Fv4uIaFINMNzcFBtB8vW8oemlOUwQdp7GRusbar20si8s0mjQUiP4kj1aFsuDAWoJcjS_l9smQ2xqm1AGahvUqiG8Jp7uUV2gAFOFHr6mgaKo2qHTtsXAZGKkMaJ0SiONgQIB_Ph_cm_xvaNwrV_fjOIoy6Nos0CxcqtmFDdX8b6VkOM9QkHrZEnCPl5sL4iXTuiqbW2ElHtiAReBkl2s4ot1dOLosg'
    ],
    menuList: [
      {
        name: 'Phở Tái',
        desc: 'Thịt bò tươi được thái mỏng.',
        price: '65.000đ',
        icon: 'ramen_dining'
      },
      {
        name: 'Phở Chín',
        desc: 'Nạm bò được ninh kỹ, thái lát đều.',
        price: '60.000đ',
        icon: 'ramen_dining'
      },
      {
        name: 'Phở Đặc Biệt',
        desc: 'Tái, chín, nạm và gầu bò giòn rụm.',
        price: '85.000đ',
        icon: 'stars'
      },
      {
        name: 'Quẩy Giòn',
        desc: 'Quẩy nóng giòn, phụ kiện không thể thiếu.',
        price: '10.000đ',
        icon: 'bakery_dining'
      }
    ],
    reviews: [
      {
        user: 'Anh Tú',
        time: 'Hôm qua',
        rating: 5,
        content: 'Nước dùng ở đây thực sự khác biệt, thanh và không bị gắt mùi mì chính. Một trong những hàng phở xưa hiếm hoi còn giữ được chất Hà Nội.',
        avatarText: 'AT',
        avatarColor: 'bg-blue-100 text-blue-700'
      },
      {
        user: 'Minh Hạnh',
        time: '3 ngày trước',
        rating: 4,
        content: 'Quán nằm trong ngõ nên hơi khó tìm một chút nhưng bù lại không gian rất hoài niệm. Phở tái lăn là món nhất định phải thử!',
        avatarText: 'MH',
        avatarColor: 'bg-green-100 text-green-700'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTkxdDOYFA2GTlwD0R7v21GVrU4BPXkRNPfr9M8-6GqaO1X9l3nNkPono8jSB4IW4Z0DTLA3wBok73KSJIR_kvcpWofCSP1WEA5NvT4_r6NyVekUSK1pavHF3FGAInJOVwydQEO6I1GCSGWq17S6gSvYTYLaE9f_NXbJcq4sKLDSKUdapSuplgPJwp4U8r2CDi_Y68rYIKWK4MizGGmX9dFaAHtvCaqcOQ9C3oLQ6TtII8fP3RDYgIhNuDzecN0b_CN86UHszn9Y',
    curatorNote: '"Để thưởng thức đúng điệu, hãy gọi thêm một đĩa quẩy giòn và một chút dấm tỏi. Quán đông nhất vào khoảng 7:30 - 8:30 sáng, hãy cân nhắc thời gian nhé!"',
    suggestions: [
      {
        name: 'Bún Chả Cá Bà Phiến',
        rating: '4.8 (850)',
        distance: '500m',
        id: 1,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzgyzOHX7pZ1fDwyoVKXbvo7kHfopgZXwFRXamKOYtQ19Y21cB1alB_j9gdCOFNOvyHc1janbb57SF32QIeiq9xbDTxTV-fUd4huPrarRee_AysOoVHcIRAtmoOPWryNloUqTB_cCTsfu6pBG90e5SPj-QxSzEMDwBmIWn-LX51sMiybKCzumMeLPjq2LACfs9LHc7KNFIj_3hTaF0GfUEFALzGDQtiAd2jW-CGx1aHQJlZES9atcF1m3jBBRKgmfAJVbyDz3pcJA'
      },
      {
        name: 'Chè Liên Đà Nẵng',
        rating: '4.3 (128)',
        distance: 'Khá xa',
        id: 6,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVyvMNeEPGf2tyMLzbt7H88IdhQ08uJjXihyAkOroMhrxljrVSNQJ3_5j6ysH4ZpWcJWiEn3Dck2gfLLk1GgxVVbapdkwkozom9yxWQuyDx5uLV0LvHwZpyljjCjFANlhQ-FgCXWmHVA8EhBxgqC2Xe-3ETzKh6xNAwJloAXeVqPH-xBAi_TicXS3ywtfXh_imtJQOrqvxw7DtGSYGDKjBepn48f9dg3FRPbC13yNjjYfOvlYRHsLIZLNBot7-JHRHCSD6gsQ_9As'
      }
    ]
  },
  3: {
    id: 3,
    name: 'Bánh Mì Phượng Hội An',
    rating: '4.9',
    reviewsCount: '1,240+',
    location: 'Hội An',
    address: '2b Phan Chu Trinh, Cẩm Châu, Hội An',
    hours: '06:30 - 21:30',
    price: '20.000đ - 35.000đ',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCujeQGyeRYNgDMIoeq-Ay0_PGQ1tsEyZnIUiAz_u_sMMtVW3MKzss5qsJ8VZMO1R1H8qyrI4zkqU6AavmnLs8ed1T6k8GThbLfq6oC7EErssytErVU7yNRNrTNr9v8ZiGR9KmGGpGWSe6kbIC-iPTKpUzMdZcWaB0lzg0ktHsNGy9d6tC73LTQPmzRLdOR0OTpa04WqATMM0dQA0W2wZMyzW4njxWr3wy4dik782Iisr9hnJ_GXRRy4CJHJeUqzBAkooJ7-LgRkr0',
    description: [
      '"Đây là chiếc bánh mì ngon nhất thế giới," cố đầu bếp lừng danh Anthony Bourdain đã từng thốt lên khi thưởng thức Bánh mì Phượng.',
      'Ra đời từ những năm 90, tiệm Bánh Mì Phượng không chỉ là một hàng ăn sáng đơn thuần mà đã trở thành biểu tượng văn hóa của Hội An. Với công thức nước sốt gia truyền đặc quánh, vị thơm của pate béo ngậy và độ giòn tan của lớp vỏ bánh được nướng cẩn thận trên than hồng, mỗi ổ bánh là một bản giao hưởng của hương vị.',
      'Sự tỉ mỉ bắt đầu từ việc chọn những cọng rau trà quế tươi rói cho đến việc tẩm ướp thịt nướng theo bí quyết riêng. Dù luôn có hàng dài khách xếp hàng, hương vị tại đây vẫn giữ được sự đồng nhất suốt hàng chục năm qua.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCujeQGyeRYNgDMIoeq-Ay0_PGQ1tsEyZnIUiAz_u_sMMtVW3MKzss5qsJ8VZMO1R1H8qyrI4zkqU6AavmnLs8ed1T6k8GThbLfq6oC7EErssytErVU7yNRNrTNr9v8ZiGR9KmGGpGWSe6kbIC-iPTKpUzMdZcWaB0lzg0ktHsNGy9d6tC73LTQPmzRLdOR0OTpa04WqATMM0dQA0W2wZMyzW4njxWr3wy4dik782Iisr9hnJ_GXRRy4CJHJeUqzBAkooJ7-LgRkr0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBsrtgN_zACeRxCWCOZvD7i3qTybwecsJbU48MFLFRDqpV3sOhCBoGLbYHxeyF9_JFJnFcgmnZRj3jX9pZRpjOIqW9Uca9dNo-L7Pq_VixmCWeCg2XrkrejwJH2KV3_MIQWHzu0OKehl34riCCPQWszBTOH4kXs083asDaxtRcVWuI2GloRfzaiERj6k8aewypAt_t3yQN606Imaa0d86eVvrdJB1BAAivjrLsB3_w4_zq2wOqVz9y3UD7Bybv_6EUjHyiW9FHTK68',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjWD9TCuEbdVCU10hvOhSJ1AEjdEQz5VO_rYUR7fYRfrfObxTfYpQ_dhWxsk4r9q1F5IPEXUnjQgHy_PbZRthV-dnMc4bf1uLKsESARWDlCQgmmHWCUb5sxlUfevEm3Ip1RlNBP-76f9sbabefaz8-F4tX0iI1Bsdt6RZoloyGhMZL-eqxa7mhcBy6WhmIyVCF6U3-_BE8E8_gGqYnGUlqf5LElMTwRASXxCg0NTSGd3D3q1Df85nEYRNRaKcezTPky3SZKqnIgHo'
    ],
    menuList: [
      {
        name: 'Bánh mì Thập cẩm',
        desc: 'Món khuyên dùng',
        price: '35.000đ',
        icon: 'lunch_dining'
      },
      {
        name: 'Bánh mì Bò sốt vang',
        desc: 'Món khuyên dùng',
        price: '35.000đ',
        icon: 'lunch_dining'
      },
      {
        name: 'Bánh mì Gà phô mai',
        desc: 'Món khuyên dùng',
        price: '30.000đ',
        icon: 'lunch_dining'
      }
    ],
    reviews: [
      {
        user: 'Minh Anh',
        time: 'Vài ngày trước',
        rating: 5,
        content: '"Nước sốt thực sự là linh hồn của chiếc bánh này. Dù phải đợi 20 phút nhưng hoàn toàn xứng đáng. Vị cay nồng hòa quyện cùng pate béo ngậy tạo nên trải nghiệm khó quên."',
        avatarText: 'MA',
        avatarColor: 'bg-red-100 text-red-700'
      },
      {
        user: 'James Wilson',
        time: '1 tuần trước',
        rating: 4.5,
        content: '"As a food journalist, I\'ve tried many versions, but Phượng\'s bread balance is unmatched. The texture of the baguette is light yet crispy. A must-visit when in Central Vietnam."',
        avatarText: 'JW',
        avatarColor: 'bg-blue-100 text-blue-700'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNGfO-G5RCgDmnL9E84wpwXSaicQYx3sYcK8c1B_7-ciU5jFDe26IOPhqfXYneOBEl5JcanwyE4IQ9Ujmk0gh3NoU-GnSxO0fXb9UaeizkctynUMy4o0Lo_jlLeKiVkwRplCtDRIO9YDIiaARVqr__O8AAcC9iz-Q8xmKMmxS_2IVs6ASNI8pQANvZ0mz6CqDxTl1_uDq8ju3y_HCQeYV115hxPIsiuTpAeFwmKjPaGGG_Q8NawPDD24HGJ-rSjeIaMn3gDKxwFjo',
    curatorNote: '',
    suggestions: [
      {
        name: 'Phở Thìn Bờ Hồ',
        rating: '4.5 (2k+)',
        distance: 'Khá xa',
        id: 2,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTkxdDOYFA2GTlwD0R7v21GVrU4BPXkRNPfr9M8-6GqaO1X9l3nNkPono8jSB4IW4Z0DTLA3wBok73KSJIR_kvcpWofCSP1WEA5NvT4_r6NyVekUSK1pavHF3FGAInJOVwydQEO6I1GCSGWq17S6gSvYTYLaE9f_NXbJcq4sKLDSKUdapSuplgPJwp4U8r2CDi_Y68rYIKWK4MizGGmX9dFaAHtvCaqcOQ9C3oLQ6TtII8fP3RDYgIhNuDzecN0b_CN86UHszn9Y'
      },
      {
        name: 'Chè Liên Đà Nẵng',
        rating: '4.3 (128)',
        distance: 'Khá xa',
        id: 6,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVyvMNeEPGf2tyMLzbt7H88IdhQ08uJjXihyAkOroMhrxljrVSNQJ3_5j6ysH4ZpWcJWiEn3Dck2gfLLk1GgxVVbapdkwkozom9yxWQuyDx5uLV0LvHwZpyljjCjFANlhQ-FgCXWmHVA8EhBxgqC2Xe-3ETzKh6xNAwJloAXeVqPH-xBAi_TicXS3ywtfXh_imtJQOrqvxw7DtGSYGDKjBepn48f9dg3FRPbC13yNjjYfOvlYRHsLIZLNBot7-JHRHCSD6gsQ_9As'
      }
    ]
  },
  4: {
    id: 4,
    name: 'Cà Phê Trứng Giảng',
    rating: '4.7',
    reviewsCount: '1k+',
    location: 'Hà Nội',
    address: '39 Nguyễn Hữu Huân, Hàng Bạc, Hoàn Kiếm, Hà Nội',
    hours: '07:00 – 22:00',
    phone: '',
    price: '25.000đ - 35.000đ',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoBknmAW3-TSXgZmO2umvJ8goRUrbRVWvDZmn09uxxnEVL8_G4WN23GgIXbOyW5dvR9WiIvrcnpw1VPdov2H-gjB8Ny-7Jg7y7akeHX1wkLkA7bIwNMzfv5Dx1gPQ9ct6QW5qBmrWVqmfTSN4qW877nUpKhFCZ9nmSg8LOB7VmcfTJMta60KN9H9dZgUl53fOk7x9-DjFCdIyTlDL5rp-Mmg2Yo06lzFgxDrwuxAxXlMxX_wecEqtoGer-1e7JCIBQIYwxWOumGxc',
    description: [
      'Được sáng lập bởi cụ Nguyễn Văn Giảng vào năm 1946, Cà phê Giảng không chỉ là một quán cà phê, mà là một biểu tượng văn hóa của Thủ đô. Trong thời kỳ khan hiếm sữa tươi, cụ Giảng đã sáng tạo bằng cách dùng lòng đỏ trứng gà đánh bông để thay thế, tạo nên món cà phê trứng huyền thoại có kết cấu sánh mịn như kem và hương vị béo ngậy đặc trưng.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALRtSMV9qHwON_66bjf-JyWQDfbADk4AZcNu_pUOhtmIEO-ttS1O2r1u6cJGRmmM7pFoMknPuDup9SMnZJUfldtLNh482pdDEzSkUbuZ38tL23xGUqFMjUkA3_1xZ-zgEIE7Y3eUQWbK4CgoxaXKqcrk139g_LQ8b4JoPUC1tBA7mt06RcnzBSPF9tO__NPkyO7dLVA_blUluH0p_k5j-rAoMgeDZVXoZlCYuCK7K8r0_gRq48hfsjUQYq7BxLg0-_UsWZyax7Rrc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwjyDYKI4_UWCoXr_7Vm4yg9WNmBg5TCHka2HhJBHqv9vWs9av-WGyhyfjBmzvuHtR5EPHMVlRknpgM4U8p8_q_sm_xyiG1eHJ5an2UT1yG1UilsQde3oQdxYvKZTna9R-q9pNBNdnCNTW0SJdmPy6NRWyk-IGNlED0AaamTRj53uGuyMTLqPRi5faP4W80BIQBhfoVzgn7cSzxN9Ps-PEBxI9mV2lJi4tAer-KwV4TYe--409C0jc-HFdglcWIyrr-hzoaQEDIFs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCQ1XqeeX8QHURTXILGtiXBXpGgiI21BXMixBHbHZzMDnJlT5WD4STVUbpiRlOd-4KhWDW07k37VGK18Q1evfrT9ieyb_RxWcwlgaQd3PCGPh3OFuLqgWD_NATThqOINGYenFp4m24OCC_77TftLHVT5h54n8xazmVYt3xCPNZvFaJalVswa2S25YbbO2PepcbVm9O7WiLBAcbuzOfKB5zrRY1xxVDhtpzZe0I2-f92dJyx-Jr0inh3-4lXWO1GBsP9DY23876nUc'
    ],
    menuList: [
      {
        name: 'Cà phê trứng',
        desc: 'Món đặc trưng của quán',
        price: '35.000đ',
        icon: 'coffee'
      },
      {
        name: 'Cà phê đen',
        desc: 'Cà phê truyền thống',
        price: '25.000đ',
        icon: 'coffee_maker'
      },
      {
        name: 'Cà phê nâu',
        desc: 'Cà phê sữa đá ngọt bùi',
        price: '30.000đ',
        icon: 'local_cafe'
      }
    ],
    reviews: [
      {
        user: 'Minh Quân',
        time: 'Hôm qua',
        rating: 5,
        content: '"Vẫn là hương vị đó sau bao nhiêu năm. Cà phê trứng nóng hổi, không hề tanh, ngồi trong không gian phố cổ thực sự rất tuyệt vời."',
        avatarText: 'MQ',
        avatarColor: 'bg-yellow-100 text-yellow-700'
      },
      {
        user: 'Linh Chi',
        time: '1 tuần trước',
        rating: 4.5,
        content: '"Quán hơi đông vào cuối tuần nhưng dịch vụ rất nhanh. Cà phê đậu xanh trứng cũng rất đáng thử cho những ai muốn đổi vị."',
        avatarText: 'LC',
        avatarColor: 'bg-green-100 text-green-700'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmpnURylRA3eNEA1ZEoQmQYnptMQNL4ck2ahLY6EbYGiG2MOhlp7G6s5Lmnke_iWHEnItm1c9HCIOGUvPx1DETNs-yr0NfcdWmJ1Ba6SDQpUYPUg4Jvi_TDr8p40U_axxmXJRjFy2lKkXFtonatw_lzLJrkTvQY02E2kVCVZfOH2YL2dhfCFnnUWbERiBugmRP_Y2MDfnMz-pUgFd-gTgMMGtvFVD6P9S1aAW1sSIg8VLq5VD5Cgr2drOS4OIQfHpMWe1grNS1gtc',
    curatorNote: '"Nên đến vào buổi sáng sớm hoặc vào các ngày trong tuần để tận hưởng không gian hoài cổ. Ngoài cà phê trứng, món Cacao Trứng cũng rất ngon!"',
    suggestions: [
      {
        name: 'Phở Thìn Bờ Hồ',
        rating: '4.5 (2k+)',
        distance: 'Gần đây',
        id: 2,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTkxdDOYFA2GTlwD0R7v21GVrU4BPXkRNPfr9M8-6GqaO1X9l3nNkPono8jSB4IW4Z0DTLA3wBok73KSJIR_kvcpWofCSP1WEA5NvT4_r6NyVekUSK1pavHF3FGAInJOVwydQEO6I1GCSGWq17S6gSvYTYLaE9f_NXbJcq4sKLDSKUdapSuplgPJwp4U8r2CDi_Y68rYIKWK4MizGGmX9dFaAHtvCaqcOQ9C3oLQ6TtII8fP3RDYgIhNuDzecN0b_CN86UHszn9Y'
      },
      {
        name: 'Bún Chả Cá Bà Phiến',
        rating: '4.8 (850)',
        distance: 'Khá xa',
        id: 1,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzgyzOHX7pZ1fDwyoVKXbvo7kHfopgZXwFRXamKOYtQ19Y21cB1alB_j9gdCOFNOvyHc1janbb57SF32QIeiq9xbDTxTV-fUd4huPrarRee_AysOoVHcIRAtmoOPWryNloUqTB_cCTsfu6pBG90e5SPj-QxSzEMDwBmIWn-LX51sMiybKCzumMeLPjq2LACfs9LHc7KNFIj_3hTaF0GfUEFALzGDQtiAd2jW-CGx1aHQJlZES9atcF1m3jBBRKgmfAJVbyDz3pcJA'
      }
    ]
  },
  5: {
    id: 5,
    name: 'Hải sản Năm Đảnh',
    rating: '4.6',
    reviewsCount: '2.4k+',
    location: 'Đà Nẵng',
    address: 'K72/K97 Tô Hiến Thành, Sơn Trà, Đà Nẵng',
    hours: '10:00 - 22:00 hàng ngày',
    phone: '',
    price: '60.000đ - 150.000đ / người',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYh3U0HoRsefvBgf1uT7GrIeBFu6g0P-NxzKhH_8rX9y5Gg0h6Wk5Uo6hXyn07nxTjmmlwBwV_dmVpeWK8gMqEAuczPdOHkZ28ACIr_kwcDbE9nmrKra-s_Q5dZBC6CEKJ46u6mrFjVcxK2QHdkSl4oUYjlEcFh4odUtBxzXZ7kurtLU-sEyzDlf4UyTWydb6lQC1AUdzVND_yNxqaWbUuKSCoUONIx7A9b5GwhW_aOBFgthocTgzhepgV-Bh5-EaGCE_Ifp0D4Fg',
    description: [
      'Nằm sâu trong những con hẻm nhỏ của quận Sơn Trà, Hải sản Năm Đảnh là một địa chỉ không thể bỏ qua đối với những tín đồ ẩm thực khi đến Đà Nẵng. Nổi tiếng với triết lý "ngon - bổ - rẻ", tất cả các món đồng giá chỉ từ vài chục nghìn đồng nhưng chất lượng luôn tươi rói như vừa đánh bắt từ biển lên.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBoXk7KdxaK3pQZidiVGFJ0KdCq9p_d8-hi9N9MvEeKAwAxQXbHaRoclrecAD-gr9YRUZ5eyzIHylMwgyJc8-YvGfQBln7qJgDbk_DixqHDxffrBEfrPeon_X47KQr103vRgPiHHjHG8HlV-SjP7NaRprfQUqU5MsXvFC1eSlgU3AwV5-b7vZdhd0WRueuXjut3QjmJa16PjZBvk7brDcjFKZHgChWV6ZSCIH-HV3csauB6mejxZ3RmEJd_0bgLANX0QC9QPzJCooY',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHKxGNQXs0rDwcbx6oXB5jBt9UuSMwvxtzjvqrG7NX0NETRg9aRs_oa4utqmedblH2J5ba5zE56h1qlqiI_SExCwf_TgGH5zb8fOHY9apxHiGbQWIe1eC3S1YgPEdVvGLGZDmfYIpnvp0RghlHyZUp0Ix89lrIc09FUEkS2pqQNnaE_aAmC3tRsYzMhlEH6exziYhVD7dEE446dLJ-5bTlRrzvCh52Ilnw51OSZ9NNnGnaGZB35QiZm2p5TiufLl3oIuLRTFuI0XE',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBHlrSXz8-BlXAPHeTEkFclsvMBCifjRQFM8T2Cwgkoikbyt7KEBT8b9lGtl2kZXVJmaThf5P022qcF41IQKTc5ss0D5qQ-NuQW1iFBo8O_VZewQZlkIlsQUeVZfvUwpPwmLh_wtXPquCCDME3OYVnqy0P0DFpBZ-zKJbvgedK6-L00TdAzgnYEhfL8vElyV3uWd6N4ok83JJVjTnIj96NbXaCSvaRGGOcZjJLVY6VH58nI-ZDSAQ0Gld-1p8Oo9hflfYI5kqOpRps'
    ],
    menuList: [
      {
        name: 'Nghêu hấp sả',
        desc: 'Hải sản tươi sống đồng giá',
        price: '60.000đ',
        icon: 'set_meal'
      },
      {
        name: 'Hàu nướng mỡ hành',
        desc: 'Hải sản tươi sống đồng giá',
        price: '60.000đ',
        icon: 'set_meal'
      },
      {
        name: 'Ốc hương xào dừa',
        desc: 'Hải sản tươi sống đồng giá',
        price: '60.000đ',
        icon: 'set_meal'
      }
    ],
    reviews: [
      {
        user: 'Anh Nguyễn',
        time: '2 ngày trước',
        rating: 5,
        content: '"Đồ ăn tươi, giá rẻ không tưởng. Tuy nhiên quán rất đông khách nên mọi người nên đi sớm trước 5h chiều để tránh phải đợi lâu."',
        avatarText: 'AN',
        avatarColor: 'bg-blue-100 text-blue-700'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA00fx4hWsNy-iXtboBVORmjMz4ucGdWHRjDv4AWjOOfGTfcRFHx1dBsNnVHKDAzS9ibD-IpxqQ7NtVcDFGxw0yHyjcgGu4ZOE6h-3VOhnlnMSBD2JnlZGrs2W0rDDPpQC4PNAiecaTBuZo8v_-4MFmZIgj21N6cLpr2_jHeMF2tTr7od54o1qABA87-yy7p6uWCzv5K4kQTFyG3dKe_yoqvZT2-kCFYTArIt-gEo6IV5oe22709Y21CG7awe5gWQj5xpXWGtyegD0',
    curatorNote: '"Vì quán nằm sâu trong hẻm nên đi lại hơi khó khăn với ô tô. Khuyến khích đi xe máy và đến sớm để tránh hết chỗ."',
    suggestions: [
      {
        name: 'Chè Liên Đà Nẵng',
        rating: '4.3 (128)',
        distance: 'Khá gần',
        id: 6,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVyvMNeEPGf2tyMLzbt7H88IdhQ08uJjXihyAkOroMhrxljrVSNQJ3_5j6ysH4ZpWcJWiEn3Dck2gfLLk1GgxVVbapdkwkozom9yxWQuyDx5uLV0LvHwZpyljjCjFANlhQ-FgCXWmHVA8EhBxgqC2Xe-3ETzKh6xNAwJloAXeVqPH-xBAi_TicXS3ywtfXh_imtJQOrqvxw7DtGSYGDKjBepn48f9dg3FRPbC13yNjjYfOvlYRHsLIZLNBot7-JHRHCSD6gsQ_9As'
      },
      {
        name: 'Bún Chả Cá Bà Phiến',
        rating: '4.8 (850)',
        distance: 'Gần đây',
        id: 1,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzgyzOHX7pZ1fDwyoVKXbvo7kHfopgZXwFRXamKOYtQ19Y21cB1alB_j9gdCOFNOvyHc1janbb57SF32QIeiq9xbDTxTV-fUd4huPrarRee_AysOoVHcIRAtmoOPWryNloUqTB_cCTsfu6pBG90e5SPj-QxSzEMDwBmIWn-LX51sMiybKCzumMeLPjq2LACfs9LHc7KNFIj_3hTaF0GfUEFALzGDQtiAd2jW-CGx1aHQJlZES9atcF1m3jBBRKgmfAJVbyDz3pcJA'
      }
    ]
  },
  6: {
    id: 6,
    name: 'Chè Liên Đà Nẵng',
    rating: '4.3',
    reviewsCount: '128',
    location: 'Đà Nẵng',
    address: '72 Nguyễn Hoàng, Đà Nẵng / 189 Hoàng Diệu, Đà Nẵng',
    hours: '08:00 - 22:00 hàng ngày',
    phone: '',
    price: '20.000đ - 50.000đ',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjfhQzcQO1uB3OnGX5ihoDkkHLT8g-BRyC5YRM4C34byv1mmj9VnBPuQXcyUHyug4Vdfq46bpCYyHrbLt62Z_O4s5bVv0658PsiRCNoHhlN7jk1jltZPlaboWCVlhAPLeh-6hYZ07dUP18kKe3M6jIQUAFgWndn5G79tPxmbf3KitzswXlC_10zWZ0FbPuzKb5JMKbY1etoiJS0kMgYr51xEAQxPOI06zwn-Ls1Vg3Ou-yHAkqq2-fXBOVcN4UQTY_xP57toZRWfg',
    description: [
      'Nhắc đến ẩm thực Đà Nẵng, không thể không kể đến thương hiệu Chè Liên. Nổi tiếng nhất tại đây chính là món chè Thái sầu riêng trứ danh, sự kết hợp hoàn hảo giữa vị béo ngậy của sầu riêng chín cây, nước cốt dừa thơm lừng và các loại thạch đa dạng. Mỗi bát chè là một bản giao hưởng hương vị nhiệt đới, làm say lòng cả những thực khách khó tính nhất.',
      'Bắt đầu từ một quán nhỏ, Chè Liên đã khẳng định vị thế của mình qua hàng chục năm bằng chất lượng nguyên liệu tươi ngon và công thức độc bản không thể trộn lẫn.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVyvMNeEPGf2tyMLzbt7H88IdhQ08uJjXihyAkOroMhrxljrVSNQJ3_5j6ysH4ZpWcJWiEn3Dck2gfLLk1GgxVVbapdkwkozom9yxWQuyDx5uLV0LvHwZpyljjCjFANlhQ-FgCXWmHVA8EhBxgqC2Xe-3ETzKh6xNAwJloAXeVqPH-xBAi_TicXS3ywtfXh_imtJQOrqvxw7DtGSYGDKjBepn48f9dg3FRPbC13yNjjYfOvlYRHsLIZLNBot7-JHRHCSD6gsQ_9As',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwb3EW22z_MqGOJcCkPTLdYvEm7Xgs2z8N0HiKU0VNcKrzU1mahMep7shIDPu6C-6DUvFS6Wd0_Td262rHoPgvrDknO1sckQW5WqT88DOh_q9b1Rq_l_HPAI50v6lO68H3EACyJlnNbwuTULDuocOIRUDq2PxryKqigEzYt0VtYhXTCjwpm9j5pXVab1H0_Uvg25WLtm3Qm1iE-L1Xo1-oLyjgv5IzTK1-h4_eFZUk4aGShiK2TsiUVVODmQ3JPBTMPoQIB35d0WY',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBfHbpocEmJtTgRvd5e90gP2td-uNZkUsK3gL6HA00Rmku72oNscgWLF_JTsz97VWdnWSlyljC-lIRRYbnnqHEIUWcpjnn_9-UAlvONaKbt5WhyT1GSfi67AlzghRME1Apz6-KP1coCJ0XiGOMXVGeE4tdadMmcr2Or2K2WzCPn9Pls72Sjo-3OB6YvDb6WI5Kgv9-GLmdxOkP3NpVJbLUem1sQ-2VhgvsaFgsG6LujvguIOFtTqyg75a8PrFWULlN7WpatpwYTfUo'
    ],
    menuList: [
      {
        name: 'Chè Thái Sầu Riêng',
        desc: 'Món đặc trưng của quán',
        price: '30.000đ',
        icon: 'icecream'
      },
      {
        name: 'Bánh Flan',
        desc: 'Mềm mịn thơm trứng caramen',
        price: '20.000đ',
        icon: 'cake'
      }
    ],
    reviews: [
      {
        user: 'Anh Nguyen',
        time: 'Vừa xong',
        rating: 5,
        content: '"Chè sầu ở đây là đỉnh nhất Đà Nẵng rồi. Nước cốt dừa thơm, béo mà không bị ngọt gắt. Phục vụ rất nhanh dù quán cực kỳ đông khách."',
        avatarText: 'AN',
        avatarColor: 'bg-blue-100 text-blue-700'
      },
      {
        user: 'Minh Hoàng',
        time: '2 ngày trước',
        rating: 4,
        content: '"Giá cả rất hợp lý cho chất lượng. Ngoài chè thái sầu riêng thì bánh flan ở đây cũng rất đáng thử, mềm mịn và thơm mùi trứng."',
        avatarText: 'MH',
        avatarColor: 'bg-green-100 text-green-700'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQQjJnWoGoiyFCZr0PIn3ulS9ngpguZVcpdEq3n7GdubU2jOg0ycDNJnIS7V8QVCu8mJx0M-AgMVqZs07pKxmePECxoomYiD8e3Pg4fNUNpnXgA7xn2mG8IdGL6YuYdLCjAqbwkLEeqqjbqrVT2m8zihGk_JnzFlBFYABPNj0PcqBerCdeKeaa9exm72d2kLQ375v7PaPts7TeFdfRi_P3uDh96N5NmTQX-ViLAFG2_nk0LvKqPXoYnU1LtMQJwpvTeS6wOh2MFX4',
    curatorNote: '"Chè Thái Sầu Riêng là món bắt buộc phải thử. Nếu bạn không ăn được sầu riêng, tàu hũ trân châu hoặc chè khúc bạch cũng ở mức xuất sắc."',
    suggestions: [
      {
        name: 'Hải sản Năm Đảnh',
        rating: '4.6 (2.4k+)',
        distance: 'Khá gần',
        id: 5,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYh3U0HoRsefvBgf1uT7GrIeBFu6g0P-NxzKhH_8rX9y5Gg0h6Wk5Uo6hXyn07nxTjmmlwBwV_dmVpeWK8gMqEAuczPdOHkZ28ACIr_kwcDbE9nmrKra-s_Q5dZBC6CEKJ46u6mrFjVcxK2QHdkSl4oUYjlEcFh4odUtBxzXZ7kurtLU-sEyzDlf4UyTWydb6lQC1AUdzVND_yNxqaWbUuKSCoUONIx7A9b5GwhW_aOBFgthocTgzhepgV-Bh5-EaGCE_Ifp0D4Fg'
      },
      {
        name: 'Bún Chả Cá Bà Phiến',
        rating: '4.8 (850)',
        distance: 'Gần đây',
        id: 1,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzgyzOHX7pZ1fDwyoVKXbvo7kHfopgZXwFRXamKOYtQ19Y21cB1alB_j9gdCOFNOvyHc1janbb57SF32QIeiq9xbDTxTV-fUd4huPrarRee_AysOoVHcIRAtmoOPWryNloUqTB_cCTsfu6pBG90e5SPj-QxSzEMDwBmIWn-LX51sMiybKCzumMeLPjq2LACfs9LHc7KNFIj_3hTaF0GfUEFALzGDQtiAd2jW-CGx1aHQJlZES9atcF1m3jBBRKgmfAJVbyDz3pcJA'
      }
    ]
  },
  7: {
    id: 7,
    name: 'Nhà Cổ Tấn Ký',
    rating: '4.9',
    reviewsCount: '128',
    location: 'Hội An',
    address: '101 Nguyễn Thái Học, Phường Minh An, Hội An, Quảng Nam',
    hours: '08:00 - 17:45 Tất cả các ngày trong tuần',
    phone: '',
    price: '120.000 VNĐ / khách',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcLAM_tAamq5V0xsaPbUX935urzsBRK8ne_lFOK0tBaAUMdtrZnyHdBnuoJ-rRHR9jQh3DFgqNFHD2TXxwfRAKWbyINELKseU5Zbiq9oak6qAGdmH0pfWwBRQsJvjVY-GW6Ygkz_cdWdOs6n7Yzhq33BHToAomdn_oS-nH8W6rvX8PYYY3-N-k_MPTXV42NvZwH7BDN1Zl2ZoY40COxiNW-B2DZhGhGZn9wsoqbkqx3MQL-CfLCoEQnv0qm7yYtVMfgyHceTCXFBc',
    description: [
      'Được xây dựng cách đây hơn 200 năm, Nhà cổ Tấn Ký là một trong những công trình kiến trúc cổ tiêu biểu nhất của đô thị cổ Hội An. Ngôi nhà mang kiến trúc hình ống đặc trưng, nơi giao thoa tinh hoa giữa ba nền văn hóa: Việt Nam, Trung Hoa và Nhật Bản.',
      'Mọi chi tiết chạm khắc trong nhà đều mang ý nghĩa nhân văn sâu sắc, từ những hàng cột gỗ lim đen bóng đến những bức hoành phi, câu đối được khảm xà cừ tinh xảo. Đây không chỉ là một bảo tàng sống mà còn là nơi lưu giữ hồn cốt của một thương cảng sầm uất thuở xưa.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQi2ASNZxnCYtpz44xPvJMsbhSG0x6qPcteK1-xVd3g8OlIKxUjY7qw3px5DR_AtPqE21YY0HW-mKsI6zvlurqckdQUy6oECKk-dDPQD8btzvkzQG8qa6WYZ-LuJy6V9fWUTN1AjjelyG2OmV02DcX7UW4W-xKl9cqFFJKNKR0e9FPsqzK9t-YvAc2DngnvSlPTiw4fmBexetQEEOMF1wXaARN0pI0LaZH113z1YbXdwGD81ezRPU1KDohz9C90ms9GR9kMXZGxJs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAZmr4v0X2ZsQXZWTCcGk4RjRFvi1_fQv_ZNwKF6p93KlaS3QcOYvMChiRBSDFLlIPDqmBur0MPdvrhxiszFG6tKpP4rASH4m3MTVH-N_c2jqZwduh71TV3kF7GMfgm-2x7qeA9uz2sXUAh72VS6NCpfQWOKzSf57I9THrYUh1dy_2iyCeEtivoiPtyoNng-7iY0EDqAuYq0HaN4hokQq5MAAmcsi0V5ZWZyenDT1Ztt_LxZB8rx1Wye0IZ6jF1r2qc8GUMLITVeJI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5tIBzscCG3UD_4HgcY6br2ulZpARK61Baoho1i10mNaWBEQDi8yEWBTyeto9vQT-n93U9C6Ps3RJBWq40zjKgwwqhYYafGpRDSqFgLww2l9xjT3w8T3S4B4439-9e9KmOIV7VwRNkpi_sRiAx4XGagnPQfNgKscYdpTgxRkeDeNz6aSQhMXzKrTn5G2kWwRmNQBOqwp9-TMm1q_60fxRLSN4izYsrXrw2YMR13vHs-1K-tssuKyvcJQCIfVxLfb44218LzvAWfls'
    ],
    menuList: [],
    reviews: [
      {
        user: 'Minh Anh Lê',
        time: '',
        rating: 5,
        content: '"Một trải nghiệm tuyệt vời để hiểu về lịch sử Hội An. Kiến trúc gỗ quá tinh xảo và được bảo tồn cực kỳ tốt. Hướng dẫn viên tại chỗ rất nhiệt tình."',
        avatarText: 'MA',
        avatarColor: 'bg-blue-100 text-blue-700',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzgYu8lLWTO_MyckrV_Bs0PrNwEXWPVTXnD-jjrj_W9zmJupaBOB_53TlnZplK_7enpZ9ue7_0Qr7XYbcC53lLxmnWQqXD-Y4RLQovTh7SeZNnqZZVhbFVyCQ6N2UD7_zjro70nmTpDlmypMekiCYBlEtZujtwx664ORR_Jpcgnt3-i3fRv6ZWnBuToTtkwQxzU_uywwD2Td7z7x3gR3XEBhbS1mXzbn5LNUUXC5yN2NdMeD-xkN9grq57TZ-BYgF_DTEd0SJcUIU'
      },
      {
        user: 'Trần Hoàng',
        time: '',
        rating: 4,
        content: '"Nhà rất đẹp, cảm giác như quay ngược thời gian. Tuy nhiên buổi chiều hơi đông khách, nên đi vào sáng sớm để cảm nhận rõ hơn sự yên tĩnh."',
        avatarText: 'TH',
        avatarColor: 'bg-green-100 text-green-700',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UzFdrMJGzatagHs_Vhd7xJmogEdEwuKtTOKTlqdUlpjn5tRZ1Too4civglRwpvzij3o3_tI-6F8_-iX21WFRfpfBhGNDKpOGQ4N716DgNx4bkq8d385PtJuRBQ6nQcEyG4QD4EKNVWS4KtHYYehEJ4zErxYJUjHn0gqJ5qcMFINEv_apBBCwy5SzADxSHw-NAnuw-mxxqNuOFjkVB9Nc0psYZRLZBn_pVL_m697To_RAmRMbQPgmqT2Qg8oaqyPES7uk-6Dxp2s'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEu973fK9csy9523iNkDm2pVot9y_qlW8yF5ePflpYaYGkk5tME2qIGh9zC_ijt8KLgK0hu9M4W-OFBrK4BDHmS9_LZHQOWy6aP7_EEbd6VjIJ6U7r7WblWTvb8UUJI9ygovjJcfeVzYNH-MjB31xhxyIBgwOOMCl7_fjVtZSBH7-e4QOaSmoFpEKLMeMH9d85GgyCYWM9qAn-o3RtbfVUc86C9qRjsC2Wd1mq2PmPlokgUk0F0Gj2pPVqwpshSvE6ut4GI6LKv-g',
    curatorNote: '"Vì đây là di tích tư nhân đang có người ở, vui lòng giữ yên lặng và không chạm vào các hiện vật trưng bày không có kính bảo vệ."',
    suggestions: [
      {
        name: 'Bánh Mì Phượng Hội An',
        rating: '4.6 (12k+)',
        distance: '10 phút đi bộ',
        id: 3,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH_yXn0Z2m1Sj7B6uE_5B_rWw9ZJ_h_0RvwA3n9m3OvyZbG4h_8EPrlZ5gq8tB9wZ8hL4O4J8rYpD-W79v5n_T21Q5z4e4hG4i_G_2E8mOqQxZg1G3_h3s-wYm3-Z4z6R16k8tQ8SIfO-t2A3g_s_lHw1-1FfL3Ww5eX5N4Nf-N4Fz7Gf_hE9m4H_A_z7s_hGf'
      }
    ]
  },
  8: {
    id: 8,
    name: 'Bún Chả Đắc Kim',
    rating: '4.4',
    reviewsCount: '1.2k+',
    location: 'Hà Nội',
    address: '1 Hàng Mành, Hoàn Kiếm, Hà Nội',
    hours: '08:30 - 21:00',
    phone: '',
    price: '100.000đ - 150.000đ',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJy89orMng70jH6ZBKZhVI4dk8VRtXAFj51DN4-wm95QAhdRb-bulx1ONr6OAkz1oWlAR6ARXWnxrASD23OGL6lef_jvINnbxO0uazNSil7bAY42dSOGlTHttEeha1Wu7XIbwgsb4y7t-4VZFhgNkyQjBWc_3u3YgQ1t2xPAVy1IsTi2u4QzhN1wOkts4if4IYPhEYHFzE893OES_-YsHmvg0F01qpxx-yXYxnr57V-FkdCgtiHIdkhfNbjDWCEQvpn10Jx01i-N8',
    description: [
      'Nằm ngay đầu phố Hàng Mành, Bún chả Đắc Kim là một trong những địa chỉ ẩm thực lâu đời nhất tại Hà Nội. Qua nhiều thế hệ, quán vẫn giữ vững công thức gia truyền với thịt nướng được tẩm ướp đậm đà, nướng than hoa thơm lừng. Bát bún chả ở đây nổi tiếng với lượng thịt "khủng", nước chấm chua ngọt thanh thanh quyện cùng tỏi ớt, tạo nên một trải nghiệm vị giác bùng nổ mà bất kỳ ai ghé thăm Thủ đô cũng không nên bỏ lỡ.'
    ],
    contentImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBOAAmdcu8uKqiQP2LZdEDfGdFApuuLJfSRNIt2kYCbftFGcM4Hfp31jfM_3DlWvhI91gopxIsXBluAKN1-I7z6YurNb53N95Rckgp_MsIHhQfNT-sAHJyKvR8I42zG8iCumAkG6jcfrbH4Ut44WX7ZLaKCbnLJJEhCMQv4oK5ta_3kufuUBSPqcWy2LnA4lNiQ7kAOnDvdWp9Ckg80V23m7EATpak4cFszDZMhjajqZPPUhWAY0GVAkWf-cXFl0nbA5qr149dFVbE',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDK0qXSeUneTyW3aktOJ5LNzF7-lPWUH9MOZiEC43vrpm2Iss2MbORItw5AFAkTOD2XP1_n1SHeRoeE8Vj3CQpxWmh6RSOHWXXIInGL_sRB34B7fkh8pmnlO2RcLvkFngsthSnnkXo924lwxgMSTg7Ok3z40yblLeWDil04vUrMEQQ_iXfVOxujSd8gz9cK2Q2_WkBp8NYcQZvgbgkR9McRxhodVzDG2TWHIMYfgJzJUazkOSNn22Rq2RiW2aOVFLvEVqpMYuj3nDc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSOW92Py9t59G1TFJ6VOxbs29kpWC6aOAdj25uYeIV-tN-dHet9GfaKf_lL-aTO_GpvtsLUyhha5kK8SmuDa6fn7_rP8Mh6zl57GIuina4gDq1j9SFPh4isvnKwIxNBkJL2MzED6mxfPXyaTQcfTgGOdDamQQZ7IqWhxleje8hiOUpIoLL6Iecge_ftkgWqxbIeztRW4oHnLYMAb7jPQUNDpZPZ-IxKeBwx2fegKwXUuHsxtM7gKE5w8zghIMey36EF0xhIVSx61I'
    ],
    menuList: [
      {
        name: 'Nem Cua Bể',
        desc: 'Đặc sản',
        price: 'Tuỳ gọi',
        icon: 'restaurant_menu'
      }
    ],
    reviews: [
      {
        user: 'Marc G.',
        time: '3 ngày trước',
        rating: 5,
        content: '"Must visit in Hanoi! The spring rolls are the best I\'ve ever had. Very generous portions."',
        avatarText: 'MG',
        avatarColor: 'bg-indigo-100 text-indigo-700',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKMzHNgNJoxRnWdiclsyt7eqyuPobYl9-a5-ybDU1Ukx7b3PhSqLY8Q-lHAJFbliNC995K0aNx50Yycb4HQgi90zrCBnqPXx_ydpL2qPsiCrA7V9Ly0TQT9q_6-SSV78dQ6bGi2WQoyaLRkyGswpIPeRbpNgEJwm-yfPx9YfWwjAQ5lTEdsn6Pm-pmGV97RKeStzdfCMtvbw2lelQv6YfiQWlvuKM1N9eaR7RPvR4cc11_6OOPpd5NgTbY7CzfNenJAfsLAq548sI'
      },
      {
        user: 'Linh Nguyen',
        time: '1 tuần trước',
        rating: 4,
        content: '"Bún chả ở đây vẫn giữ được phong độ, thịt nướng rất thơm. Giá hơi cao so với mặt bằng chung nhưng chất lượng tương xứng."',
        avatarText: 'LN',
        avatarColor: 'bg-green-100 text-green-700',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXr7iENc2d2vhKy3OJ8Teb2cS3OWK3RXkYHSwN9NOUDejSNe0fF3Y4z_JCMOCsAdlOpz3HI-_AGLek9jLu8kvE68zthWS9D213LouqcS9i_QHPEsOf9CQpL89IJ7SeVp1GOqgJMNB0wtSN0ZO0gHI7ZLl_3kLeZXHwkMN-W5pPnvuwrCRpjx5H9KoOG5z7yKnh6nolhiLgiw9NsVY5jz3UCcUn7-_XJajA6L1_UdLM2laWyKO4DsAuBdVNb8VfXZVhII39dirqYt4'
      }
    ],
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRjBDKHGwzM_Yi-W7oJTn-JL3eJX6yGnkr8zRKnVz0eW-lL-JwnQzd9_xR--rF3vPtmOQVyhujDTDNhXxo3SXsKB9hR6SFel2xr0rOTeea9uoJ_Tsql3B9tqqE-wzUEHh-CmvkV0ynOvuNYRjKQNHGKQk6phNxCSIc-g72rZZVHPUP1jOHZtB7qUIU9Foif6SME8XD10zq6k8vGfPPDH3JIKiipewpdaGSMF3H_NyPg4eqA_TAt1gLY6o8ym5n4YoRr9bBv2ibXU8',
    curatorNote: '',
    suggestions: [
      {
        name: 'Cà Phê Trứng Giảng',
        rating: '4.7 (3.2k+)',
        distance: 'Gần đây',
        id: 4,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoBknmAW3-TSXgZmO2umvJ8goRUrbRVWvDZmn09uxxnEVL8_G4WN23GgIXbOyW5dvR9WiIvrcnpw1VPdov2H-gjB8Ny-7Jg7y7akeHX1wkLkA7bIwNMzfv5Dx1gPQ9ct6QW5qBmrWVqmfTSN4qW877nUpKhFCZ9nmSg8LOB7VmcfTJMta60KN9H9dZgUl53fOk7x9-DjFCdIyTlDL5rp-Mmg2Yo06lzFgxDrwuxAxXlMxX_wecEqtoGer-1e7JCIBQIYwxWOumGxc'
      },
      {
        name: 'Phở Thìn Bờ Hồ',
        rating: '4.5 (2k+)',
        distance: 'Khá gần',
        id: 2,
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTkxdDOYFA2GTlwD0R7v21GVrU4BPXkRNPfr9M8-6GqaO1X9l3nNkPono8jSB4IW4Z0DTLA3wBok73KSJIR_kvcpWofCSP1WEA5NvT4_r6NyVekUSK1pavHF3FGAInJOVwydQEO6I1GCSGWq17S6gSvYTYLaE9f_NXbJcq4sKLDSKUdapSuplgPJwp4U8r2CDi_Y68rYIKWK4MizGGmX9dFaAHtvCaqcOQ9C3oLQ6TtII8fP3RDYgIhNuDzecN0b_CN86UHszn9Y'
      }
    ]
  }
};


function PlaceDetailPage() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const [suggestPage, setSuggestPage] = useState(0);

  const placeData = PLACES_DETAIL_DATA[id];

  // --- Tính toán phân trang Reviews ---
  const REVIEWS_PER_PAGE = 2;
  const reviews = placeData?.reviews || [];
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const pagedReviews = reviews.slice(
    reviewPage * REVIEWS_PER_PAGE,
    (reviewPage + 1) * REVIEWS_PER_PAGE
  );

  // --- Tính toán Gợi ý gần đây dynamic ---
  const SUGGEST_PER_PAGE = 3;
  const allOtherPlaces = Object.values(PLACES_DETAIL_DATA).filter(
    (p) => p.id !== placeData?.id
  );
  const sameCity = allOtherPlaces.filter((p) => p.location === placeData?.location);
  const suggestList = sameCity.length > 0
    ? [...sameCity, ...allOtherPlaces.filter((p) => p.location !== placeData?.location)]
    : allOtherPlaces;
  const totalSuggestPages = Math.ceil(suggestList.length / SUGGEST_PER_PAGE);
  const pagedSuggestions = suggestList.slice(
    suggestPage * SUGGEST_PER_PAGE,
    (suggestPage + 1) * SUGGEST_PER_PAGE
  );

  if (!placeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold mb-2">Đang cập nhật nội dung</h2>
          <p className="text-slate-500 mb-6">Địa điểm này hiện đang trong quá trình biên soạn chi tiết.</p>
          <Link to="/explore" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">
            Quay lại Khám phá
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==============================================================
            Hero Section
            ============================================================== */}
        <section className="relative h-[450px] w-full rounded-xl overflow-hidden mb-8 shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url('${placeData.heroImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{placeData.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                  <Star className="text-accent-500 w-4 h-4 fill-accent-500" />
                  <span className="ml-1 font-bold text-sm">{placeData.rating}</span>
                  <span className="ml-1 text-xs opacity-80">({placeData.reviewsCount} đánh giá)</span>
                </div>
                <span className="text-white/80 text-sm">• {placeData.location}</span>
              </div>
            </div>
            {/* Lưu địa điểm */}
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="bg-white hover:bg-slate-50 text-slate-900 px-5 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-lg transition-transform hover:scale-105"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
              {isSaved ? 'Đã lưu' : 'Lưu địa điểm'}
            </button>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ==============================================================
              Left Column: Content (70%)
              ============================================================== */}
          <div className="lg:w-[70%] space-y-8">
            
            {/* Quick Info Group */}
            <div className={`grid grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${placeData.phone ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center text-primary-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Địa chỉ</p>
                  <p className="text-sm font-medium">{placeData.address.split(',')[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Giờ mở cửa</p>
                  <p className="text-sm font-medium">{placeData.hours}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mức giá</p>
                  <p className="text-sm font-medium">{placeData.price}</p>
                </div>
              </div>
              {placeData.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-lg">call</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Điện thoại</p>
                    <p className="text-sm font-medium">{placeData.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Flavor & History */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Hương vị & Lịch sử</h2>
              <div className="prose max-w-none text-slate-600 leading-relaxed">
                {placeData.description.map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {/* Optional Content Images (Grid) */}
              {placeData.contentImages && placeData.contentImages.length > 0 && (
                <div className={`grid gap-4 mt-6 ${placeData.contentImages.length === 3 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {placeData.contentImages.map((img, idx) => (
                    <div key={idx} className={`rounded-2xl overflow-hidden ${placeData.contentImages.length === 3 && idx === 0 ? 'row-span-2 h-full' : 'h-48 md:h-full'}`}>
                      <img src={img} alt="Hình ảnh không gian và món ăn" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Menu Must Try */}
            {placeData.menuList && placeData.menuList.length > 0 && (
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">Thực đơn nổi bật</h2>
                  <Link to="#" className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline">
                    Xem tất cả <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {placeData.menuList.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       {item.img ? (
                         <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                           <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                           <span className="material-symbols-outlined text-3xl">{item.icon || 'restaurant'}</span>
                         </div>
                       )}
                       <div className="flex-1 flex flex-col justify-center">
                         <div className="flex justify-between items-start">
                           <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                           <span className="font-bold text-primary-600 ml-2">{item.price}</span>
                         </div>
                         <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Đánh giá từ cộng đồng</h2>
                  {totalReviewPages > 1 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Trang {reviewPage + 1} / {totalReviewPages} · {reviews.length} đánh giá
                    </p>
                  )}
                </div>
                <button className="text-primary-600 font-bold text-sm bg-primary-600/10 px-4 py-2 rounded-lg hover:bg-primary-600/20 transition-colors">
                  Viết đánh giá
                </button>
              </div>

              <div className="space-y-4">
                {pagedReviews.map((review, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg ${review.avatarColor || 'bg-slate-200 text-slate-600'}`}>
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.user} className="w-full h-full object-cover" />
                      ) : (
                        review.avatarText
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{review.user}</h4>
                        <span className="text-xs text-slate-400">{review.time}</span>
                      </div>
                      <div className="flex text-accent-500">
                        {[...Array(review.rating || 5)].map((_, idx) => (
                          <Star key={idx} className="w-4 h-4 fill-accent-500" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">{review.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang Reviews */}
              {totalReviewPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                    disabled={reviewPage === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" /> Trước
                  </button>
                  <div className="flex gap-2">
                    {[...Array(totalReviewPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReviewPage(idx)}
                        className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                          idx === reviewPage
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setReviewPage((p) => Math.min(totalReviewPages - 1, p + 1))}
                    disabled={reviewPage === totalReviewPages - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Tiếp <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* ==============================================================
              Right Column: Widgets (30%)
              ============================================================== */}
          <aside className="lg:w-[30%] space-y-6">
            
            {/* Map Widget */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-sm">Vị trí</span>
                <button className="text-primary-600 text-xs font-bold uppercase tracking-wide hover:underline">Mở Maps</button>
              </div>
              <div className="h-48 bg-slate-200 relative">
                <img src={placeData.mapImage} alt="Map View" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="text-rose-500 w-10 h-10 fill-rose-500 drop-shadow-md" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500 leading-tight italic">{placeData.address}</p>
              </div>
            </div>

            {/* AI Itinerary CTA */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-6 shadow-lg space-y-4 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl drop-shadow-sm">✨</span>
                <h3 className="font-bold text-lg">Công cụ AI</h3>
              </div>
              <p className="text-white/90 text-sm font-medium leading-relaxed">Bạn muốn thêm địa điểm này vào lịch trình du lịch {placeData.location.split(',')[0]} tự động?</p>
              <Link to="/planner" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md">
                <Plus className="w-4 h-4" />
                Thêm vào AI Itinerary
              </Link>
            </div>

            {/* Curator Note */}
            {placeData.curatorNote && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3 text-amber-700">
                  <span className="material-symbols-outlined shrink-0">verified</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Lưu ý từ SavoryTrip</span>
                </div>
                <p className="italic text-slate-600 leading-relaxed text-sm">
                  {placeData.curatorNote}
                </p>
              </div>
            )}

            {/* Gợi ý gần đây - Dynamic */}
            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Gợi ý gần đây</h3>
                {totalSuggestPages > 1 && (
                  <span className="text-xs text-slate-400">{suggestPage + 1}/{totalSuggestPages}</span>
                )}
              </div>
              <div className="space-y-3">
                {pagedSuggestions.map((place) => (
                  <Link
                    key={place.id}
                    to={`/place/${place.id}`}
                    className="flex gap-3 items-center group"
                    onClick={() => { setReviewPage(0); setSuggestPage(0); }}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={place.heroImage}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold group-hover:text-primary-600 transition-colors truncate">{place.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Star className="text-accent-500 w-3 h-3 fill-accent-500" />
                        <span>{place.rating} ({place.reviewsCount} đánh giá)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{place.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Phân trang Gợi ý */}
              {totalSuggestPages > 1 && (
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    onClick={() => setSuggestPage((p) => Math.max(0, p - 1))}
                    disabled={suggestPage === 0}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  {[...Array(totalSuggestPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSuggestPage(idx)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                        idx === suggestPage
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setSuggestPage((p) => Math.min(totalSuggestPages - 1, p + 1))}
                    disabled={suggestPage === totalSuggestPages - 1}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Link
                to="/explore"
                className="w-full py-2.5 mt-1 text-primary-600 text-sm font-bold border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Khám phá thêm địa điểm
              </Link>
            </div>
            
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PlaceDetailPage;
