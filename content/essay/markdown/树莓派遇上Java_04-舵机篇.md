# 树莓派遇上Java_04-舵机篇

## APQX

## 2016年9月14日

在马达篇中，我们知道了如何用树莓派来控制马达转动，但是在有些情况下，我们不仅仅想让马达转动，还想要它转动到制定角度并固定在那个位置，这时就要用到伺服电机或舵机，他们本质上也是马达，但是通过内置的闭环系统和接收的特定信号可以实现旋转特定角度的功能。一般来说，舵机可以用来控制遥控车的前轮转向，机器人关节的活动，机械臂的运转这些对位置精确度要求较高的地方，它所需要的控制信号也不是简单的高低电平，而是PWM波。

![pic](../assets/Servo.jpg)

使用舵机需要三根线，黄色是信号线，红色是正极，褐色是负极，正负极可以直接接在L298N的5伏电压输出口和负极上，信号线则接在树莓派的PWM针脚上。

舵机使用的PWM波是一种周期20毫秒（即50赫兹）由高低电平组成的控制信号，通过控制高电平所持续的时间就可以让舵机到达指定的角度。一般来说，对于180度舵机，高电平在信号周期内持续时间和舵机角度有一下关系： 

```
0.5毫秒----------0度 
1.0毫秒----------45度 
1.5毫秒----------90度 
2.0毫秒----------135度 
2.5毫秒----------180度
```

即如果你想让舵机转到45度位置并保持该角度，那么需要向舵机输出一个周期是20毫秒的信号，并且信号的前1.0毫秒是高电平，后19.0毫秒是低电平，由于舵机的运动需要时间，所以这个信号要持续一段时间才能保证舵机移动到正确的位置，如果此时信号仍然在持续，那么舵机内部将产生一个力矩来阻止外力改变其角度，即固定在指定的角度。

树莓派上输出PWM波有两种方法，首先树莓派拥有23个可以输出高低电平信号的GPIO针脚，可以通过软件控制它们产生需要的波形，但是软件层面的操作毕竟无法做到精确，即使输出的波形成功让舵机转动也不可避免的会产生抖动，效果并不理想。实际上，树莓派配有4个PWM针脚可以精确地输出需要的波形，但是在软件层面如何设定参数以实现正确的波形输出很令人困惑，我在 StackOverFlow上找到了下面一段话

>It says here that we're looking to create pulse of 1ms to 2ms in length, every 20ms or so. Assuming this 19.2Mhz base clock is indeed correct, setting pwm clock to 400 and pwm range to 1000, should give a pulse at 48Hz or every 20.8 ms. Then setting pwm value to 48 should give you a 1ms long pulse and a pwm value of 96 should give you a 2ms long pulse. But you need to set the chip in pwm-ms mode. (Lots of shoulds here, since I do not have an osciolloscope either)

这段话提到了树莓派的时钟频率这种我并不熟悉的硬件概念，重要的是他随后提供了一些参数，通过试验，我找到了能准确控制自己舵机的参数，下面是一个简单的示例

```
import com.pi4j.io.gpio.*;


/**
 * Created by apqx on 2016/9/11.
 * 此程序中的PWM值仅适用于DS3218舵机，其他型号舵机可以自行尝试PWM值
 * DS3218：可180度旋转，pwm控制旋转到固定的角度
 * pwm=70则舵机处于中位，pwm=117则舵机相对中位逆时针旋转90度，pwm=23则舵机相对中位顺时针旋转90度
 */
public class Demo {

    public static void main(String[] args)throws Exception{
        GpioController gpio=GpioFactory.getInstance();
        //DS3218
        GpioPinPwmOutput DS3218=gpio.provisionPwmOutputPin(RaspiPin.GPIO_26);
        com.pi4j.wiringpi.Gpio.pwmSetMode(com.pi4j.wiringpi.Gpio.PWM_MODE_MS);
        com.pi4j.wiringpi.Gpio.pwmSetRange(1000);
        com.pi4j.wiringpi.Gpio.pwmSetClock(400);
        //舵机处于中位
        DS3218.setPwm(70);
        //舵机相对中位顺时针旋转90度
        DS3218.setPwm(23);
        //则舵机相对中位逆时针旋转90度
        DS3218.setPwm(117);
        
        gpio.shutdown();
    }

}
```
                
树莓派3B有4个PWM输出针脚：GPIO01、GPIO26、GPIO23、GPIO24，但实际上GPIO01和GPIO26都是PWM0，GPIO23和GPIO24都是PWM1，也就是，GPIO01和GPIO26、GPIO23和GPIO24的输出信号分别是一样的，这就很尴尬了，导致树莓派只能同时控制舵机做两种动作，根本不能分别控制4个舵机。当然了，也有解决方法，我们可以在软件上做一些手脚，比如，当控制GPIO01的舵机运动前禁止GPIO26输出信号，当需要GPIO26的舵机运动前禁止GPIO01输出信号并恢复GPIO26的信号输出功能，实现代码如下

```
import com.pi4j.io.gpio.*;


/**
 * Created by apqx on 2016/9/11.
 * 此程序中的PWM值仅适用于DS3218舵机，其他型号舵机可以自行尝试PWM值
 * DS3218：可180度旋转，pwm控制旋转到固定的角度
 * pwm=70则舵机处于中位，pwm=117则舵机相对中位逆时针旋转90度，pwm=23则舵机相对中位顺时针旋转90度
 */
public class Demo {
    private static GpioPinPwmOutput DS3218_1;
    private static GpioPinPwmOutput DS3218_2;
    private static GpioController gpio;
    public static void main(String[] args)throws Exception{
        gpio=GpioFactory.getInstance();
        initServo();
        //DS3218
        DS3218_1=gpio.provisionPwmOutputPin(RaspiPin.GPIO_26);
        DS3218_2=gpio.provisionPwmOutputPin(RaspiPin.GPIO_01);

        //DS3218_1输出前停止DS3218_2输出
        stopDS3218_2();
        DS3218_1.setPwm(50);

        //延时1秒等待舵机到达指定角度
        Thread.currentThread().sleep(1000);

        //DS3218_2输出前停止DS3218_1输出，并恢复DS3812_2输出
        stopDS3218_1();
        startDS3218_2();
        DS3218_2.setPwm(50);

        //延时1秒等待舵机到达指定角度
        Thread.currentThread().sleep(1000);

        gpio.shutdown();

    }
    //停止DS3218_1输出
    public static void stopDS3218_1(){
        DS3218_1.unexport();
        gpio.unprovisionPin(DS3218_1);
    }
    //恢复DS3218_1输出
    public static void startDS3218_1(){
        DS3218_1=gpio.provisionPwmOutputPin(RaspiPin.GPIO_26);
        initServo();

    }
    //停止DS3218_2输出
    public static void stopDS3218_2(){
        DS3218_2.unexport();
        gpio.unprovisionPin(DS3218_2);
    }
    //恢复DS3218_2输出
    public static void startDS3218_2(){
        DS3218_2=gpio.provisionPwmOutputPin(RaspiPin.GPIO_01);
        initServo();

    }
    private static void initServo(){
        com.pi4j.wiringpi.Gpio.pwmSetMode(com.pi4j.wiringpi.Gpio.PWM_MODE_MS);
        com.pi4j.wiringpi.Gpio.pwmSetRange(1000);
        com.pi4j.wiringpi.Gpio.pwmSetClock(400);
    }

}
```
                
具体在项目中的使用逻辑肯定比这个复杂得多，需要考虑到各种情况，做出合理的判断以避免错误，但是如果只是让舵机动起来，就是以上这么简单。