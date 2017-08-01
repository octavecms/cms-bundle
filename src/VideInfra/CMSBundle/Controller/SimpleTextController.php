<?php

namespace VideInfra\CMSBundle\Controller;

use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Form\SimpleTextType;
use VideInfra\CMSBundle\PageType\SimpleTextPageType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class SimpleTextController extends Controller
{
    public function editAction(Request $request, Page $page = null)
    {
        $isNew = !$page;
        $pageRepository = $this->get('vig.cms.page.repository');
        $isAdmin = ($this->getParameter('vig.cms.super_admin_role'))
            ? $this->get('security.authorization_checker')
                ->isGranted($this->getParameter('vig.cms.super_admin_role'))
            : true;

        if (!$page) {
            $page = $pageRepository->create();
            $page->setType(SimpleTextPageType::TYPE);
        }

        $form = $this->createForm(SimpleTextType::class, $page, [
            'method' => 'post',
            'is_admin' => $isAdmin,
            'locales' => $this->getParameter('locales')
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            $emptyName = false;
            if (!$page->getName()) {
                $emptyName = true;
                $page->setName(sprintf('simple_text_%s', time()));
            }

            $content = $page->getContent();
            $content->setPage($page);

            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();
            $em->flush();

            if ($emptyName) {
                $page->setName(sprintf('simple_text_%d', $page->getId()));
            }
            $page->setController($this->getParameter('vig.cms.simple_text_controller'));
            $page->setOption('id', $page->getId());

            $em->flush();

            if (!$isNew) {

                if ($request->get('update_and_list')) {
                    return $this->redirectToRoute('admin_videinfra_cms_page_list');
                }
                else {
                    return $this->redirectToRoute('admin_videinfra_cms_page_edit', ['id' => $page->getId()]);
                }
            }
            else {
                if ($request->get('create_and_list')) {
                    return $this->redirectToRoute('admin_videinfra_cms_page_list');
                }
                else {
                    return $this->redirectToRoute('admin_videinfra_cms_page_create_type', ['type' => 'custom']);
                }
            }
        }

        return $this->render('VideInfraCMSBundle:Page:create_simple_txt.html.twig', [
            'page' => $page,
            'form' => $form->createView(),
            'isNew' => $isNew,
            'isAdmin' => $isAdmin
        ]);
    }

    /**
     * @param Page $page
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showAction(Page $page)
    {
        $template = $this->getParameter('vig.cms.simple_text_template');

        return $this->render($template, [
            'page' => $page
        ]);
    }
}