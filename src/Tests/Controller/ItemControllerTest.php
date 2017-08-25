<?php

namespace VideInfra\CMSBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Client;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class ItemControllerTest extends WebTestCase
{
    /** @var Client */
    private $client;

    public function setUp()
    {
        static::bootKernel();
        $this->client = static::createClient();
    }

    public function testListAction()
    {
        $this->logIn();
        $this->client->request('GET', '/admin/media/item/list');

        $response = $this->client->getResponse();
        $data = json_decode($response->getContent(), true);
        $this->assertTrue($data['status']);
    }

    private function logIn()
    {
        $session = $this->client->getContainer()->get('session');

        // the firewall context defaults to the firewall name
        $firewallContext = 'main';

        $token = new UsernamePasswordToken('admin', null, $firewallContext, array('ROLE_ADMIN'));
        $session->set('_security_'.$firewallContext, serialize($token));
        $session->save();

        $cookie = new Cookie($session->getName(), $session->getId());
        $this->client->getCookieJar()->set($cookie);
    }
}