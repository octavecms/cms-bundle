<?php

namespace VideInfra\CMSBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use VideInfra\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockController extends Controller
{
    public function editAction(Request $request, Page $page = null)
    {
        return $this->render('VideInfraCMSBundle:Block:edit.html.twig', []);
    }
}